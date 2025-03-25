import { customAlphabet } from 'nanoid';
import Database from "better-sqlite3";
import JWT from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const allowedChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

class userData {
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
        this.generateUserId = customAlphabet("0123456789", 6);
        this.generateTokenId = customAlphabet(allowedChar, 10);
    }

    initializeTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT
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
                winner_id INTEGER,
                winner_nickname TEXT NOT NULL,
                loser_id INTEGER,
                loser_nickname TEXT NOT NULL,
                game_type TEXT NOT NULL CHECK ( game_type IN ( 'ping-pong', 'rock-paper', 'tic-tac-toe' ) ),
                date INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ( winner_id ) REFERENCES users ( id ) ON DELETE SET NULL,
                FOREIGN KEY ( loser_id ) REFERENCES users ( id ) ON DELETE SET NULL,
                CHECK ( winner_id <> loser_id )
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
                chat_id INTEGER,
                sender_id INTEGER NOT NULL,
                message BLOB NOT NULL,
                date INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ( chat_id ) REFERENCES chats ( id ) ON DELETE CASCADE,
                FOREIGN KEY ( sender_id ) REFERENCES users ( id ) ON DELETE CASCADE
            )
        `);
    }
    /**
     * @brief hello world
    */
    createUser(username, email, password) {
        const result = {success: true, table: "users", action: "create"};
        let attempts = 0;
        
        while (++attempts < 5)
        {
            try {
                const stmt = this.db.prepare(`    
                    INSERT INTO users (id, username, email, password )
                    VALUES ( ?, ?, ?, ? ) RETURNING *
                `);
                result.data = stmt.get(this.generateUserId(), username, email, password);
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
        return result;
    }

    deleteUser(userIdentifier) {
        const result = {success: true, table: "users", action: "delete"};
        
        try {
            const stmt = this.db.prepare(`DELETE FROM users WHERE id = ? OR username = ? OR email = ? RETURNING *`);
            result.data = stmt.get(userIdentifier, userIdentifier, userIdentifier);;
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return result;
    }

    fetchUser(userIdentifier) {
        const result = {success: true, table: "users", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ? OR username = ? OR email = ?`);
            result.data = stmt.get(userIdentifier, userIdentifier, userIdentifier);
            if (!result.data)
                throw new Error("User not found");
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return result;
    }

    fetchAllUser() {
        const result = {success: true, table: "users", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`SELECT * FROM users`);
            result.data = stmt.all();
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return result;
    }

    updateUser(userIdentifier, {username, email, password}) {
        const result = {success: true, table: "users", action: "update"};
        const newData = {username: username, email: email, password: password}
        
        try {
            const stmt = this.db.prepare(`UPDATE users SET 
                username = COALESCE(@username, username), 
                email = COALESCE(@email, email), 
                password = COALESCE(@password, password) 
                WHERE id = ? OR username = ? OR email = ? RETURNING *
            `);
            result.data = stmt.get(newData, userIdentifier, userIdentifier, userIdentifier);;
        }
        catch (error) {
            result.success = true;
            result.error = error;
        }

        return result
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

        return result;
    }

    deleteSession(tokenId) {       
        const result = {success: true, table: "sessions", action: "delete"}; 
        
        try {
            const stmt = this.db.prepare(`DELETE FROM sessions WHERE token_id = ? RETURNING *`);
            result.data = stmt.get(tokenId);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return result;
    }

    deleteAllSessions(userId) {
        const result = {success: true, table: "sessions", action: "delete"}; 
        
        try {
            const stmt = this.db.prepare(`DELETE FROM sessions WHERE user_id = ? RETURNING *`);
            result.data = stmt.all(userId);
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return result;
    }

    fetchSession(sessionTokenId) {
        const result = {success: true, table: "sessions", action: "fetch"};
        
        try {
            const stmt = this.db.prepare(`SELECT * FROM sessions WHERE token_id = ?`);
            result.data = stmt.get(sessionTokenId);
            if (!result.data)
                throw new Error("Session not found");
            result.data.title = `${result.data.ip_address} on ${result.data.browser} (${result.data.platform})`
        }
        catch (error) {
            result.success = false;
            result.error = error;
        }

        return result;
    }

    verifySession(token)
    {
        const result = {success: true, table: "sessions", action: "verify"}; 
        let tokendata;
        try {
            tokendata = JWT.verify(token, JWT_SECRET, {complete: true});
            if (!tokendata.header.jti)
                throw new Error("invalid Token");

            const dbresult = this.fetchSession(tokendata.header.jti);

            if (!dbresult.success)
                throw new Error(dbresult.error.message);

            if (tokendata.payload.user_id != dbresult.data.user_id)
                throw new Error("invalid Token");
            result.data = dbresult.data;
        }
        catch (error)
        {
            result.success = false;
            result.error = error;

            if (tokendata && tokendata.header.jti)
                this.deleteSession(tokendata.header.jti);
        }

        return result;
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

        return result;
    }

    // createGameHistory()

    /**
     * create game
     * fetch game
     * delete game
     * create chat
     * fetch chat
     * delete chat
     * create message
     * fetch message
     * delete message
     * create friend request
     * accept friend request
     * reject friend request
     * block user
     * unblock user
     * fetch all users exept blocked
     * 
    */

    closeDataBase() {
        this.db.close();
    }
}

export default userData;