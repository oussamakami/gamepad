import { customAlphabet } from 'nanoid';
import Database from 'better-sqlite3';
import Compressor from 'zlib';
import JWT from 'jsonwebtoken';
import { clearInterval } from 'timers';
import Dotenv from 'dotenv';

Dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_PICTURES = ["default1.webp", "default2.webp", "default3.webp"]
const allowedChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

class userData {
    #cachedTokens = {}

    constructor(databaseFile, devMode) {
        if (devMode) {
            this.db = new Database(databaseFile, { verbose: console.log } );
            this.db.pragma('foreign_keys = ON');
        }
        else
            this.db = new Database(databaseFile);

        this.db.pragma('journal_mode = WAL');
        try {
            this.initializeTables();
            console.log("Database successfully initialized.");
        }
        catch (error) {
            console.error("Failed to initialize the database: ", error);
            this.db.close();
        }
        this.generateUserId = customAlphabet("0123456789", 8);
        this.generateTokenId = customAlphabet(allowedChar, 10);

        //Schedule a task to clear expired cached sessions every hour (3600000 ms)
        this.cacheClearingJob = setInterval(this.#clearExpiredCache, 3600000);

        //Schedule a task to remove expired sessions from the database every hour (3600000 ms)
        this.sessionsClearingJob = setInterval(this.#cleanExpiredSessions, 3600000);
    }

    initializeTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                _2fa BOOLEAN DEFAULT false CHECK ( _2fa IN ( true, false ) ),
                _2fa_method TEXT NOT NULL DEFAULT 'email' CHECK ( _2fa_method IN ( 'email', 'app' ) ),
                profile_priv TEXT NOT NULL DEFAULT 'public' CHECK ( profile_priv IN ( 'public', 'friends', 'private' ) ),
                history_priv TEXT NOT NULL DEFAULT 'public' CHECK ( history_priv IN ( 'public', 'friends', 'private' ) ),
                picture TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_id TEXT PRIMARY KEY,
                user_id INTEGER,
                ip_address TEXT NOT NULL,
                browser TEXT NOT NULL,
                platform TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                FOREIGN KEY ( user_id ) REFERENCES users ( id ) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS games_history (
                win_id INTEGER,
                win_name TEXT NOT NULL,
                lose_id INTEGER,
                lose_name TEXT NOT NULL,
                game_type TEXT NOT NULL CHECK ( game_type IN ( 'ping-pong', 'rock-paper', 'tic-tac-toe' ) ),
                date INTEGER NOT NULL,
                FOREIGN KEY ( win_id ) REFERENCES users ( id ) ON DELETE SET NULL,
                FOREIGN KEY ( lose_id ) REFERENCES users ( id ) ON DELETE SET NULL,
                CHECK ( win_id <> lose_id )
            );
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY,
                user1_id INTEGER,
                user2_id INTEGER,
                FOREIGN KEY ( user1_id ) REFERENCES users ( id ) ON DELETE SET NULL,
                FOREIGN KEY ( user2_id ) REFERENCES users ( id ) ON DELETE SET NULL,
                CHECK ( user1_id < user2_id ),
                UNIQUE ( user1_id, user2_id )
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                chat_id INTEGER,
                sender_id INTEGER,
                message BLOB NOT NULL,
                date INTEGER NOT NULL,
                FOREIGN KEY ( chat_id ) REFERENCES chats ( id ) ON DELETE CASCADE,
                FOREIGN KEY ( sender_id ) REFERENCES users ( id ) ON DELETE CASCADE
            );
            
            CREATE TRIGGER IF NOT EXISTS update_messages_on_chat_user_null
            AFTER UPDATE OF user1_id, user2_id ON chats
            FOR EACH ROW
            WHEN NEW.user1_id IS NULL OR NEW.user2_id IS NULL
            BEGIN
                UPDATE messages 
                SET sender_id = NULL 
                WHERE chat_id = NEW.id AND sender_id IN (OLD.user1_id, OLD.user2_id);
            END;
            CREATE TRIGGER IF NOT EXISTS delete_chat_when_users_null
            AFTER UPDATE ON chats
            FOR EACH ROW
            WHEN NEW.user1_id IS NULL AND NEW.user2_id IS NULL
            BEGIN
                DELETE FROM chats WHERE id = NEW.id;
            END;
        `);
    }

    createUser(username, email, password) {
        const result = {success: true, table: "users", action: "create"};
        const picture = DEFAULT_PICTURES[Math.random() * DEFAULT_PICTURES.length | 0]
        let attempts = 0;
        
        while (++attempts < 5)
        {
            try {
                const stmt = this.db.prepare(`
                    INSERT INTO users (id, username, email, password, picture)
                    VALUES ( ?, ?, ?, ?, ? ) RETURNING *
                `);
                result.data = stmt.get(this.generateUserId(), username, email, password, picture);
                break;
            }
            catch (error) {
                if (error.message.includes("users.id") && attempts < 5)
                    continue;
                result.success = false;
                result.error = error;
                break;
            }
        }
        return (result);
    }

    deleteUser(userIdentifier) {
        const result = {success: true, table: "users", action: "delete"};

        try {
            const stmt = this.db.prepare(`DELETE FROM users WHERE id = ? OR username = ? OR email = ? RETURNING *`);
            result.data = stmt.get(...Array(3).fill(userIdentifier));
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchUser(userIdentifier) {
        const result = {success: true, table: "users", action: "fetch"};

        try {
            const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ? OR username = ? OR email = ?`);
            result.data = stmt.get(...Array(3).fill(userIdentifier));

            if (!result.data) {
                delete result.data;
                throw new Error("User does not exist");
            }
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchAllUsers() {
        const result = {success: true, table: "users", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`SELECT * FROM users`);
            result.data = stmt.all();
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    updateUser(userIdentifier, updateData) {
        const result = {success: true, table: "users", action: "update"};
        const defaultKeys = [
            "username", "email", "password", "enable2FA",
            "method2FA", "profilePrivacy", "historyPrivacy", "picture"];
        updateData = Object.fromEntries(defaultKeys.map(key => [key, updateData[key]]));
        try {
            const stmt = this.db.prepare(`UPDATE users SET 
                username = COALESCE(@username, username), 
                email = COALESCE(@email, email), 
                password = COALESCE(@password, password),
                _2fa = COALESCE(@enable2FA, _2fa),
                _2fa_method = COALESCE(@method2FA, _2fa_method),
                profile_priv = COALESCE(@profilePrivacy, profile_priv),
                history_priv = COALESCE(@historyPrivacy, history_priv),
                picture = COALESCE(@picture, picture)
                WHERE id = ? OR username = ? OR email = ? RETURNING *
            `);
            result.data = stmt.get(updateData, ...Array(3).fill(userIdentifier));

            if (!result.data) {
                delete result.data;
                throw new Error("User not found");
            }
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    createSession(userIdentifier, rememberMe, sessionData) {
        const result = {success: true, table: "sessions", action: "create"};
        const userData = this.fetchUser(userIdentifier);
        const rowData = {...sessionData};

        try {
            if (!userData.success)
                throw new Error(userData.error.message);
            
            rowData.user_id = userData.data.id;
            rowData.token_id = this.generateTokenId();
            rowData.tokenExpiration = Math.floor(Date.now() / 1000) + (rememberMe ? 2592000 : 86400);

            const tokenHeader = {jti: rowData.token_id, iss: "Gamepad-api"}
            const tokenPayload = {user_id: rowData.user_id, exp: rowData.tokenExpiration};
            const stmt = this.db.prepare(`
                INSERT INTO sessions (
                token_id, user_id, ip_address,
                browser, platform, expires_at )
                VALUES ( @token_id, @user_id, @sessionIp,
                @sessionBrowser, @sessionPlatform, @tokenExpiration) RETURNING *
            `);
            result.data = stmt.get(rowData);
            result.data.token = JWT.sign(tokenPayload, JWT_SECRET, {header: tokenHeader});
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    deleteSession(tokenId) {       
        const result = {success: true, table: "sessions", action: "delete"};
        try {
            const stmt = this.db.prepare(`DELETE FROM sessions WHERE token_id = ? RETURNING *`);
            result.data = stmt.get(tokenId);
            delete this.#cachedTokens[tokenId];
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    #cleanExpiredSessions()
    {
        try {
            const now = Math.floor(Date.now() / 1000);
            const stmt = this.db.prepare(`DELETE FROM sessions WHERE expires_at < ?`);

            stmt.set(now);
        }
        catch (error) {}
    }

    deleteAllSessions(userId) {
        const result = {success: true, table: "sessions", action: "delete"}; 
        
        try {
            const stmt = this.db.prepare(`DELETE FROM sessions WHERE user_id = ? RETURNING *`);
            result.data = stmt.all(userId);
            result.data.forEach(element => delete this.#cachedTokens[element.token_id]);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchSession(sessionTokenId) {
        const result = {success: true, table: "sessions", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`SELECT * FROM sessions WHERE token_id = ?`);
            result.data = stmt.get(sessionTokenId);

            if (!result.data) {
                delete result.data;
                throw new Error("Session not found");
            }

            result.data.title = `${result.data.ip_address} on ${result.data.browser} (${result.data.platform})`
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    #addSessionToCache(token_id, sessionData) {
        const now = Math.floor(Date.now() / 1000);

        this.#cachedTokens[token_id] = {
            data: sessionData,
            cacheExpiration: (now + 300)
        };
    }
    
    #getCachedSession(token_id) {
        const now = Math.floor(Date.now() / 1000);
        const session = this.#cachedTokens[token_id];

        if (session)
        {
            if (session.cacheExpiration > now)
                return (session.data);
            else
                delete this.#cachedTokens[token_id];
        }
        return (undefined);
    }

    #clearExpiredCache() {
        const now = Math.floor(Date.now() / 1000);

        for (const token_id in this.#cachedTokens) {
            if (this.#cachedTokens[token_id].cacheExpiration < now)
                delete this.#cachedTokens[token_id]
        }
    }

    verifySession(token) {
        const result = {success: true, table: "sessions", action: "verify"};
        let tokendata;

        try {
            tokendata = JWT.verify(token, JWT_SECRET, {complete: true});
            if (!tokendata.header.jti)
                throw new Error("invalid Token");

            const cacheData = this.#getCachedSession(tokendata.header.jti);

            if (cacheData) {
                result.data = cacheData;
                return (result);
            }

            const dbresult = this.fetchSession(tokendata.header.jti);

            if (!dbresult.success)
                throw new Error(dbresult.error.message);

            if (tokendata.payload.user_id != dbresult.data.user_id)
                throw new Error("invalid Token");
            result.data = dbresult.data;
            this.#addSessionToCache(tokendata.header.jti, result.data);
        }
        catch (error)
        {
            result.success = false;
            result.error = error;

            if (tokendata && tokendata.header.jti)
                this.deleteSession(tokendata.header.jti);
        }

        return (result);
    }

    fetchAllUserSessions(userId) {
        const result = {success: true, table: "sessions", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`SELECT * FROM sessions WHERE user_id = ?`);
            result.data = stmt.all(userId);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    #prettifyDate(date)
    {
        const diff = Math.floor(Date.now() / 1000) - date;

        const MINUTE = 60;
        const HOUR = 3600;
        const DAY = 86400;
        const WEEK = 604800;
        const MONTH = 2592000;

        if (diff < MINUTE)
            return (`${diff} second${diff === 1 ? '' : 's'} ago`);
        if (diff < HOUR)
            return (`${Math.floor(diff / MINUTE)} minute${Math.floor(diff / MINUTE) === 1 ? '' : 's'} ago`);
        if (diff < DAY)
            return (`${Math.floor(diff / HOUR)} hour${Math.floor(diff / HOUR) === 1 ? '' : 's'} ago`);
        if (diff < WEEK)
            return (`${Math.floor(diff / DAY)} day${Math.floor(diff / DAY) === 1 ? '' : 's'} ago`);
        if (diff < MONTH)
            return `${Math.floor(diff / WEEK)} week${Math.floor(diff / WEEK) === 1 ? '' : 's'} ago`;
        else {
            const dateObj = new Date(date * 1000);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return (dateObj.toLocaleDateString('en-US', options));
        }
    }

    addGameRecord(matchData) {
        const result = {success: true, table: "games_history", action: "create"};
        const defaultKeys = ["win_id", "win_name", "lose_id", "lose_name","game_type", "date"];

        matchData = Object.fromEntries(defaultKeys.map(key => [key, matchData[key]]));

        if (!matchData.date)
            matchData.date = Math.floor(Date.now() / 1000);

        try {
            const stmt = this.db.prepare(`
                INSERT INTO games_history (
                win_id, win_name,
                lose_id, lose_name, game_type, date )
                VALUES ( @win_id, @win_name, @lose_id,
                @lose_name, @game_type, @date ) RETURNING *
            `);
            result.data = stmt.get(matchData);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchGameRecords(pageNumber = 1) {
        const result = {success: true, table: "games_history", action: "fetch"};
        const valuePerPage = 12;

        try {
            const stmt = this.db.prepare(`
                SELECT
                    u1.username AS winner_username,
                    g.win_name AS winner_nickname,
                    u2.username AS loser_username,
                    g.lose_name AS loser_nickname,
                    g.game_type, g.date
                FROM games_history g
                JOIN users u1 ON (u1.id = g.win_id)
                JOIN users u2 ON (u2.id = g.lose_id)
                ORDER BY g.date DESC LIMIT ? OFFSET ?
            `);

            if (typeof pageNumber !== "number" || isNaN(pageNumber) || pageNumber < 1)
                throw new Error("invalid page number value");

            result.data = stmt.all(valuePerPage, ((pageNumber - 1) * valuePerPage));
            result.data.forEach(row => row.date = this.#prettifyDate(row.date));
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchUserGameRecords(userIdentifier, pageNumber = 1) {
        const result = {success: true, table: "games_history", action: "fetch"};
        const user = this.fetchUser(userIdentifier);
        const valuePerPage = 20;

        try {
            const stmt = this.db.prepare(`
                SELECT
                    u1.username AS user_username,
                    (CASE
                        WHEN g.win_id = ? THEN g.win_name
                        ELSE g.lose_name
                    END) AS user_nickname,
                    u2.username AS enemy_username,
                    (CASE
                        WHEN g.win_id = ? THEN g.lose_name
                        ELSE g.win_name
                    END) AS enemy_nickname,
                    (g.win_id = ?) AS isWinner,
                    g.game_type, g.date
                FROM games_history g
                JOIN users u1 ON (u1.id = ?)
                JOIN users u2 ON (u2.id = (
                    CASE
                        WHEN g.win_id = ? THEN g.lose_id
                        ELSE g.win_id
                    END))
                WHERE g.win_id = ? OR g.lose_id = ?
                ORDER BY g.date DESC LIMIT ? OFFSET ?
            `);

            if (typeof pageNumber !== "number" || isNaN(pageNumber) || pageNumber < 1)
                throw new Error("invalid page number value");
            if (!user.success)
                throw new Error(user.error.message);

            result.data = stmt.all(...Array(7).fill(user.data.id), valuePerPage, ((pageNumber - 1) * valuePerPage));
            result.data.forEach(row => row.date = this.#prettifyDate(row.date));
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchLeaderBoard() {
        const result = {success: true, table: "games_history", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`
                SELECT
                    g.win_id AS userId,
                    u.username,
                    COUNT(*) AS wins
                FROM games_history g
                JOIN users u ON u.id = g.win_id
                GROUP BY g.win_id
                ORDER BY wins DESC
                LIMIT 10
            `);
            
            result.data = stmt.all();
        } catch (error) {
            result.success = false;
            result.error = error;
        }
        
        return (result);
    }

    fetchTotalGameCounts() {
        const result = {success: true, table: "games_history", action: "fetch"};

        try {
            const stmt = this.db.prepare(`
                SELECT
                    COUNT( * ) AS global,
                    SUM( game_type = 'ping-pong' ) AS 'ping-pong',
                    SUM( game_type = 'tic-tac-toe' ) AS 'tic-tac-toe',
                    SUM( game_type = 'rock-paper' ) AS 'rock-paper'
                FROM games_history
            `);
    
            result.data = stmt.get();
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchUserWinCounts(userIdentifier) {
        const result = {success: true, table: "games_history", action: "fetch"};

        try {
            const stmt = this.db.prepare(`
                SELECT
                    COUNT( * ) AS total,
                    SUM( game_type = 'ping-pong' ) AS 'ping-pong',
                    SUM( game_type = 'tic-tac-toe' ) AS 'tic-tac-toe',
                    SUM( game_type = 'rock-paper' ) AS 'rock-paper'
                FROM games_history
                WHERE win_id = ?
            `);

            const queryResponse = this.fetchUser(userIdentifier);

            if (!queryResponse.success)
                throw new Error(queryResponse.error.message);
    
            result.data = stmt.get(queryResponse.data.id);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }
        return (result);
    }

    fetchUserLoseCounts(userIdentifier) {
        const result = {success: true, table: "games_history", action: "fetch"};

        try {
            const stmt = this.db.prepare(`
                SELECT
                    COUNT( * ) AS total,
                    SUM( game_type = 'ping-pong' ) AS 'ping-pong',
                    SUM( game_type = 'tic-tac-toe' ) AS 'tic-tac-toe',
                    SUM( game_type = 'rock-paper' ) AS 'rock-paper'
                FROM games_history
                WHERE lose_id = ?
            `);

            const queryResponse = this.fetchUser(userIdentifier);

            if (!queryResponse.success)
                throw new Error(queryResponse.error.message);
    
            result.data = stmt.get(queryResponse.data.id);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }
        return (result);
    }

    fetchTodayGameCounts() {
        const result = {success: true, table: "games_history", action: "fetch"};
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        try {
            const stmt = this.db.prepare(`
                SELECT
                    COUNT( * ) AS global,
                    SUM( game_type = 'ping-pong' ) AS 'ping-pong',
                    SUM( game_type = 'tic-tac-toe' ) AS 'tic-tac-toe',
                    SUM( game_type = 'rock-paper' ) AS 'rock-paper'
                FROM games_history
                WHERE date >= ?
            `);
    
            result.data = stmt.get(Math.floor(date.getTime() / 1000));
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    #generateWeekTimeStamps() {
        const result = {labels: [], timestamps: []}
        const labelFormat = {month: 'short', day: 'numeric'}; // (e.g. "Feb 22")
        
        for (let count = 6; count >= 0; count--) {
            const date = new Date();
            date.setDate(date.getDate() - count);
            date.setHours(0, 0, 0, 0);

            result.labels.push(date.toLocaleString('default', labelFormat));
            result.timestamps.push(Math.floor(date.getTime() / 1000));
        }

        return (result);
    }
    fetchProjection() {
        const result = {success: true, table: "games_history", action: "fetch"};
        const weekData = this.#generateWeekTimeStamps();
        const gamesCount = [];

        try {
            const stmt = this.db.prepare(`
                SELECT
                    COUNT( * ) AS count
                FROM games_history
                WHERE date >= ? AND date < ?
            `);

            for (let index = 0; index < weekData.timestamps.length; index++) {
                let dayStart = weekData.timestamps[index];
                let dayEnd = dayStart + 86400;
                gamesCount.push(stmt.get(dayStart, dayEnd).count || 0);
            }

            result.data = {dates: weekData.labels, values: gamesCount};
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchGlobalStats() {
        const result = {success: true, table: "games_history", action: "fetch"};
        const total = this.fetchTotalGameCounts();
        const today = this.fetchTodayGameCounts();
        const projections = this.fetchProjection();
        const leaderBoard = this.fetchLeaderBoard();
        const history = this.fetchGameRecords(1);
        const data = {};

        try {
            if (!total.success)
                throw new Error("total => " + total.error.message);
            if (!today.success)
                throw new Error("today => " + today.error.message);
            if (!projections.success)
                throw new Error("projection => " + projections.error.message);
            if (!leaderBoard.success)
                throw new Error("leaderBoard => " + leaderBoard.error.message);
            if (!history.success)
                throw new Error("history => " + history.error.message);

            data.total = total.data;
            data.today = today.data;
            data.projections = projections.data;
            data.leaderBoard = leaderBoard.data;
            data.history = history.data;

            result.data = data;
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchUserGlobalStats(userIdentifier) {
        const result = {success: true, table: "games_history", action: "fetch"};
        const user = this.fetchUser(userIdentifier);
        const wins = this.fetchUserWinCounts(userIdentifier);
        const loses = this.fetchUserLoseCounts(userIdentifier);
        const history = this.fetchUserGameRecords(userIdentifier, 1);
        const data = {};

        try {
            if (!user.success)
                throw new Error("user => " + user.error.message);
            if (!wins.success)
                throw new Error("wins => " + wins.error.message);
            if (!loses.success)
                throw new Error("loses => " + loses.error.message);
            if (!history.success)
                throw new Error("history => " + history.error.message);

            data.id = user.data.id;
            data.username = user.data.username;
            data.email = user.data.email;
            data.total = {};
            data.total.total = wins.data.total + loses.data.total;
            data.total['ping-pong'] = wins.data['ping-pong'] + loses.data['ping-pong'];
            data.total['tic-tac-toe'] = wins.data['tic-tac-toe'] + loses.data['tic-tac-toe'];
            data.total['rock-paper'] = wins.data['rock-paper'] + loses.data['rock-paper'];
            data.wins = wins.data;
            data.loses = loses.data;
            data.history = history.data;

            result.data = data;
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    createNewChat(userIdentifier1, userIdentifier2) {
        const result = {success: true, table: "chats", action: "create"};
        let user1 = this.fetchUser(userIdentifier1);
        let user2 = this.fetchUser(userIdentifier2);

        try {
            const stmt = this.db.prepare(`
                INSERT INTO chats ( user1_id, user2_id )
                VALUES ( ?, ? ) RETURNING *
            `);

            if (!user1.success || !user2.success)
                throw new Error(!user1.success ? user1.error.message : user2.error.message);

            if (user1.data.id > user2.data.id)
                [user1, user2] = [user2, user1];

            if (user1.data.id === user2.data.id)
                throw new Error("a user cannot create a chat with themselves")

            result.data = stmt.get(user1.data.id, user2.data.id);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchUserChats(userIdentifier, pageNumber = 1) {
        const result = {success: true, table: "chats", action: "fetch", done: false};
        const user = this.fetchUser(userIdentifier);
        const valuePerPage = 20;

        try {
            const stmt = this.db.prepare(`
                SELECT c.id AS chat_id, u.username AS recipient_name,
                (CASE
                    WHEN c.user1_id = ? THEN c.user2_id
                    ELSE c.user1_id
                END) AS recipient_id
                FROM chats c

                JOIN users u ON
                u.id = (CASE
                            WHEN c.user1_id = ? THEN c.user2_id
                            ELSE c.user1_id
                        END)
                WHERE c.user1_id = ? OR c.user2_id = ?
                ORDER BY chat_id ASC
                LIMIT ? OFFSET ?
            `);

            if (typeof pageNumber !== "number" || isNaN(pageNumber) || pageNumber < 1)
                throw new Error("invalid page number value");

            if (!user.success)
                throw new Error(user.error.message);

            result.data = stmt.all(...Array(4).fill(user.data.id), valuePerPage, ((pageNumber - 1) * valuePerPage));

            if (result.data.length < valuePerPage)
                result.done = true;
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchChatByParticipants(userIdentifier1, userIdentifier2) {
        const result = {success: true, table: "chats", action: "fetch"};
        let user1 = this.fetchUser(userIdentifier1);
        let user2 = this.fetchUser(userIdentifier2);

        try {
            const stmt = this.db.prepare(`SELECT * FROM chats WHERE user1_id = ? AND user2_id = ?`);

            if (!user1.success || !user2.success)
                throw new Error(!user1.success ? user1.error.message : user2.error.message);

            if (user1.data.id > user2.data.id)
                [user1, user2] = [user2, user1];

            result.data = stmt.get(user1.data.id, user2.data.id);

            if (!result.data) {
                delete result.data;
                throw new Error("Chat not found");
            }
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchChat(chat_id) {
        const result = {success: true, table: "chats", action: "fetch"};

        try {
            const stmt = this.db.prepare(`SELECT * FROM chats WHERE id = ?`);

            result.data = stmt.get(chat_id);

            if (!result.data) {
                delete result.data;
                throw new Error("Chat not found");
            }
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchAllChats()
    {
        const result = {success: true, table: "chats", action: "fetch"};

        try {
            const stmt = this.db.prepare(`SELECT * FROM chats`);

            result.data = stmt.all();
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    deleteChat(chat_id) {
        const result = {success: true, table: "chats", action: "delete"};

        try {
            const stmt = this.db.prepare(`DELETE FROM chats WHERE id = ? RETURNING *`);

            result.data = stmt.get(chat_id);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    removeUserFromChat(chat_id, userIdentifier) {
        const result = {success: true, table: "chats", action: "update"};
        const user = this.fetchUser(userIdentifier);
        const chat = this.fetchChat(chat_id);

        try {
            const stmt = this.db.prepare(`
                UPDATE chats SET
                    user1_id = (CASE WHEN user1_id = ? THEN NULL ELSE user1_id END),
                    user2_id = (CASE WHEN user2_id = ? THEN NULL ELSE user2_id END)
                WHERE (? IN ( user1_id, user2_id ) ) AND id = ? RETURNING *
            `);

            if (!user.success || !chat.success)
                throw new Error(!user.success ? user.error.message : chat.error.message);

            result.data = stmt.get(...Array(3).fill(user.data.id), chat_id);

            if (!result.data) {
                delete result.data;
                throw new Error("User not found in chat")
            }
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    sendMessage(chat_id, senderIdentifier, message) {
        const result = { success: true, table: "messages", action: "create" };
        const user = this.fetchUser(senderIdentifier);
        const chat = this.fetchChat(chat_id);
    
        try {
            const stmt = this.db.prepare(`
                INSERT INTO messages (chat_id, sender_id, message, date)
                VALUES (?, ?, ?, ?) RETURNING *
            `);

            if (!message || message.trim() === "")
                throw new Error("Message cannot be empty.");
            if (!chat.success || !user.success)
                throw new Error(!chat.success ? chat.error.message : user.error.message);
            if (chat.data.user1_id !== user.data.id && chat.data.user2_id !== user.data.id)
                throw new Error("User is not a participant in this chat");

            const content = message.trim();

            result.data = stmt.get(chat_id, user.data.id, Compressor.deflateSync(content), Math.floor(Date.now() / 1000));
            result.data.message = content;
        } 
        catch (error) {
            result.success = false;
            result.error = error.message;
        }
    
        return (result);
    }

    deleteMessage(message_id)
    {
        const result = {success: true, table: "messages", action: "delete"};

        try {
            const stmt = this.db.prepare(`DELETE FROM messages WHERE id = ? RETURNING *`);

            result.data = stmt.get(message_id);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    #fetchCompressedChatMessages(chat_id, pageNumber = 1) {
        const result = {success: true, table: "messages", action: "fetch", done: false};
        const chat = this.fetchChat(chat_id);
        const valuePerPage = 20;

        try {
            const stmt = this.db.prepare(`
                SELECT * FROM messages WHERE chat_id = ?
                ORDER BY date ASC LIMIT ? OFFSET ?
            `);

            if (typeof pageNumber !== "number" || isNaN(pageNumber) || pageNumber < 1)
                throw new Error("invalid page number value");

            if (!chat.success)
                throw new Error(chat.error.message);

            result.data = stmt.all(chat_id, valuePerPage, ((pageNumber - 1) * valuePerPage));

            if (result.data.length < valuePerPage)
                result.done = true;
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return (result);
    }

    fetchChatMessages(chat_id, pageNumber = 1) {
        let result = this.#fetchCompressedChatMessages(chat_id, pageNumber);

        if (!result.success)
            return (result);

        result.data = result.data.filter(row => {
            try {
                row.message = Compressor.inflateSync(row.message).toString();
                row.date = this.#prettifyDate(row.date);
                return true;
            } catch (error) {
                return false;
            }
        })

        return (result);
    }

    closeDataBase() {
        clearInterval(this.cacheClearingJob);
        clearInterval(this.sessionsClearingJob);
        this.db.close();
    }
}

export default userData;