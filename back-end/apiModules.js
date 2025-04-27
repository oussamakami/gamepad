import inputValidator from './inputValidator.js';
import Mailer from './mailer.js';
import twoFA from './twofa.js';
import userData from './database.js'
import SocketManager from './socketManager.js';
import { readFile } from 'fs/promises'
import { join } from 'path';
import Dotenv from 'dotenv';

Dotenv.config();
const VALIDEXT = ["png", "jpg", "jpeg", "webp"];
const PICTURES_PATH = process.env.PICTURES_PATH;
const database = new userData("", false);
const CONNECTIONS = new SocketManager(database);

//generate random data for testing

import RecordGenerator from './randomGenerator.js';

const numberOfUsersToGenerate = 149;
const numberOfRecordsToGenerate = 9869;
const generator = new RecordGenerator(database);

generator.generate(numberOfUsersToGenerate, numberOfRecordsToGenerate);
generator.showGeneratedUsers(3);

//generate random data for testing


function getSessionInfo(requestPacket) {
    const browserList = {
        "Firefox": "Firefox",
        "Chrome": "Chrome",
        "Safari": "Safari",
        "Edg": "Edge",
        "Opera": "Opera",
        "Trident": "IE",
        "MSIE": "IE",
        "SamsungBrowser": "Samsung Internet"
    };
    const platformList = {
        "Android": "Android",
        "iOS": "iOS",
        "Linux": "Linux",
        "Macintosh": "Mac OS",
        "Windows NT 10.0": "Win 10",
        "Windows NT 6.3": "Win 8.1",
        "Windows NT 6.2": "Win 8",
        "Windows NT 6.1": "Win 7",
        "Windows": "Win"
    };

    const userAgent = requestPacket.headers["user-agent"]

    const result = {sessionIp: "N/A", sessionBrowser: "N/A", sessionPlatform: "N/A"};
    result.sessionIp = requestPacket.headers["x-forwarded-for"] || requestPacket.ip || "N/A";

    if (!userAgent)
        return result;

    for (const [keyword, browserName] of Object.entries(browserList)) {
        if (!userAgent.includes(keyword))
            continue;
        result.sessionBrowser = browserName;
        break;
    }

    for (const [keyword, platformName] of Object.entries(platformList)) {
        if (!userAgent.includes(keyword))
            continue;
        result.sessionPlatform = platformName;
        break;
    }

    return result;
}

function verifyRequestToken(request, reply, next) {
    if (request.url.includes("/auth/")) return next();

    const sessionToken = request.cookies.authToken;
    const verification = database.verifySession(sessionToken);

    if (!verification.success) {
        reply.clearCookie('authToken');
        return reply.status(401).send({error: "Unauthorized Access"});
    }

    request.user_id = verification.data.user_id;
    request.token_id = verification.data.token_id;

    next();
}

function handleSignUp(request, reply) {
    const username = request.body.username;
    const password = request.body.password;
    const useTerms = request.body.useTerms;
    const email = inputValidator.normalizeEmail(request.body.email);

    if (!inputValidator.validateUserName(username) ||
        !inputValidator.validateEmail(email) ||
        !inputValidator.validatePassword(password) ||
        useTerms !== "on") {
            return reply.status(400).send({error: "Invalid Request"});
        }

    const queryResponse = database.createUser(username, email, password);

    if (queryResponse.success)
            return reply.status(201).send({message: "Account Created"});

    if (queryResponse.error.message.includes("UNIQUE"))
        return reply.status(409).send({error: "Username or Email already taken"});

    return reply.status(500).send({error: "Internal Server Error"});
}

function handleLogIn(request, reply) {
    const userIdentifier = request.body.identifer;
    const password = request.body.password;
    const rememberSession = request.body.remember === "on";
    
    if (!inputValidator.validateIdentifier(userIdentifier) ||
    !inputValidator.validatePassword(password)) {
        return reply.status(400).send({error: "Invalid Request"});
    }
    const user = database.checkCredentials(userIdentifier, password);

    if (user.success) {
        if (user.data.twofa_enabled) {
            if (user.data.twofa_method === "email")
                Mailer.sendTwoFAEmail(user.data.email, twoFA.getEmailToken(user.data.twofa_secret));
            const serial = twoFA.getSerial(user.data.id);
            return reply.send({ redirectTo: `/twofa?id=${encodeURIComponent(user.data.id)}&serial=${encodeURIComponent(serial)}&remember=${rememberSession}` });
        }
        const session = database.createSession(user.data.id, rememberSession, getSessionInfo(request));

        reply.setCookie("authToken", session.data.token, {path: "/", priority: "High"});
        delete user.data.twofa_secret;
        delete user.data.password;
        return reply.status(200).send({message: "Login successful!", ...user.data});
    }
    if (!user.error.code)
        return reply.status(403).send({error: user.error.message});
    return reply.status(500).send({error: "Internal Server Error"});
}

function handleUsersRelations(request, reply) {
    const sender = request.user_id;
    const {action, target} = request.body;
    
    if (!action || !target)
        return reply.status(400).send({error: "Invalid Request"});

    const senderData = database.fetchUser(sender);
    const targetData = database.fetchUser(target);

    if (!senderData.success || !targetData.success)
        return reply.status(404).send({error: senderData.success ? targetData.error.message : senderData.error.message});

    let queryResponse;

    switch(action) {
        case "add":
            queryResponse = database.sendFriendRequest(sender, target);
            break;
        case "cancel":
            queryResponse = database.rejectFriendRequest(sender, target);
            break;
        case "accept":
            queryResponse = database.acceptFriendRequest(sender, target);
            break;
        case "decline":
            queryResponse = database.rejectFriendRequest(target, sender);
            break;
        case "unfriend":
            queryResponse = database.unfriendUser(sender, target);
            break;
        case "block":
            queryResponse = database.blockUser(sender, target);
            break;
        case "unblock":
            queryResponse = database.unblockUser(sender, target);
    }

    if (!queryResponse)
        return reply.status(400).send({error: "Invalid Request"});

    if (!queryResponse.success) {
        if (!queryResponse.error.code)
            return reply.status(403).send({error: queryResponse.error.message});
        return reply.status(500).send({error: "Internal Server Error"});
    }

    const relations = database.fetchFriendshipData(sender, target);

    reply.status(201).send(relations);
}

function fetchSessionData(request, reply) {
    const queryResponse = database.fetchUser(request.user_id);

    if (!queryResponse.success)
        return reply.status(404).send({error: queryResponse.error.message});

    return reply.status(200).send({id: queryResponse.data.id,
        username: queryResponse.data.username, email: queryResponse.data.email});
}

async function fetchProfilePicture(request, reply) {
    const queryResponse = database.fetchUser(request.params.userId);

    if (!queryResponse.success)
        reply.status(404).send({error: queryResponse.error.message});

    const filename = queryResponse.data.picture;
    const path = join(PICTURES_PATH, filename);
    const extention = filename.split(".").pop();

    if (!VALIDEXT.includes(extention))
        return reply.status(500).send({error: "Internal Server Error"});

    try {
        const image = await readFile(path);

        reply.header('Content-Type', `image/${extention}`);
        return reply.status(200).send(image);
    }
    catch (error) {
        return reply.status(500).send({error: "Internal Server Error"});
    }
}

function fetchUserData(request, reply) {
    const currentUser = request.user_id;
    let targetUser = database.fetchUser(request.params.userId);

    if (!targetUser.success)
        reply.status(404).send({error: targetUser.error.message});
    targetUser = targetUser.data.id;

    const relation = database.fetchFriendshipData(currentUser, targetUser);
    if (relation?.status === "blocked")
        reply.status(404).send({error: "User does not exist"});

    const stats = database.fetchUserGlobalStats(targetUser);
    if (!stats.success)
        return reply.status(500).send({error: "Internal Server Error"});

    if (relation) stats.data.friendship = relation;
    return reply.status(200).send(stats.data);
}

function fetchDashBoardStats(request, reply) {
    const queryResponse = database.fetchGlobalStats();

    if (!queryResponse.success)
        return reply.status(500).send({error: "Internal Server Error"});
    return reply.status(200).send(queryResponse.data);
}

function handleLogout(request, reply) {
    if (!request.token_id)
        return reply.status(401).send({error: "Unauthorized Access"});

    const { success } = database.deleteSession(request.token_id);
    reply.clearCookie('authToken');

    if (!success)
        return reply.status(500).send({error: "Internal Server Error"});
    return reply.status(200).send({message: "Logged out Successfully"});
}

function sendRecovery(request, reply) {
    const email = inputValidator.normalizeEmail(request.body.email);

    if (!inputValidator.validateEmail(email))
        return reply.status(400).send({error: "Invalid Request"});

    const userAcc = database.fetchUser(email);

    if (!userAcc.success)
        return reply.status(200).send({message: "Check inbox for further instructions!"});

    const serial = twoFA.getSerial(userAcc.data.id);
    const url = `${request.headers.origin}/reset`+
                `?id=${encodeURIComponent(userAcc.data.id)}` +
                `&serial=${encodeURIComponent(serial)}`;
    
    Mailer.sendRecoveryEmail(email, url);
    return reply.status(200).send({message: "Check inbox for further instructions!"});
}

function verifySerial(request, reply) {
    const userid = request.query.id;
    const serial = request.query.serial;

    if (!twoFA.verifySerial(userid, serial, false))
        return reply.status(404).send({error: "page not found"});
    return reply.status(200).send({message: "valid serial"});
}

function handleAccountReset(request, reply) {
    const userid = request.body.userid;
    const serial = request.body.serial;
    const password = request.body.password;
    const passwordConfirmation = request.body.confirmPassword;

    if (password != passwordConfirmation)
        return reply.status(403).send({error: "password confirmation doesnt match"});

    if (!twoFA.verifySerial(userid, serial))
        return reply.status(400).send({error: "Invalid Request"});

    const user = database.updateUser(userid, { password });
    if (!user.success)
        return reply.status(500).send({error: "Internal Server Error"});
    
    const session = database.createSession(userid, false, getSessionInfo(request));
    reply.setCookie("authToken", session.data.token, {path: "/", priority: "High"});

    delete user.data.password;
    delete user.data.twofa_secret;
    return reply.status(200).send({message: "Login successful!", ...user.data});
}

function handletwoFa(request, reply) {
    const userid = request.body.userid;
    const serial = request.body.serial;
    const token = request.body.token;
    const remember = request.body.remember;
    const user = database.fetchUser(userid);

    if (!user.success)
        return reply.status(500).send({error: "Internal Server Error"});

    if (!twoFA.verifyToken(user.data.twofa_secret, token))
        return reply.status(403).send({error: "invalid 2fa code"});

    if (!twoFA.verifySerial(userid, serial))
        return reply.status(400).send({error: "Invalid Request"});

    const session = database.createSession(userid, remember === "true", getSessionInfo(request));
    reply.setCookie("authToken", session.data.token, {path: "/", priority: "High"});

    delete user.data.password;
    delete user.data.twofa_secret;
    return reply.status(200).send({message: "Login successful!", ...user.data});
}

function handleSearch(request, reply) {
    const currentUser = request.user_id;
    const search = request.params.query;
    const queryResponse = database.searchForUsers(currentUser, search);

    if (!queryResponse.success) {
        if (!queryResponse.error.code)
            return reply.status(403).send({error: queryResponse.error.message});
        return reply.status(500).send({error: "Internal Server Error"});
    }
    return reply.status(200).send({data: queryResponse.data, length: queryResponse.data.length});
}

function fetchUserFriends(request, reply) {
    const currentUser = request.user_id;
    const queryResponse = database.fetchUserFriends(currentUser);

    if (!queryResponse.success) {
        if (!queryResponse.error.code)
            return reply.status(403).send({error: queryResponse.error.message});
        return reply.status(500).send({error: "Internal Server Error"});
    }
    return reply.status(200).send({data: queryResponse.data, length: queryResponse.data.length});
}

function fetchUserChats(request, reply) {
    const currentUser = request.user_id;
    const chatToCreate = request.query.create;

    if (chatToCreate)
        database.createNewChat(currentUser, chatToCreate);

    const chats = database.fetchUserChats(currentUser);

    if (!chats.success)
        return reply.status(400).send({error: "Invalid Request"});

    chats.data.forEach(row => {
        const wins = database.fetchUserWinCounts(row.id);
        const loses = database.fetchUserLoseCounts(row.id);
        const messages = database.fetchChatMessages(row.chat_id);
        const friendship = database.fetchFriendshipData(currentUser, row.id);

        row.wins = wins.data?.total;
        row.loses = loses.data?.total;
        row.friendship = friendship;
        row.messages = messages.data;
        row.unread = false;
        if (messages.data?.length)
            row.unread = messages.data.at(-1)?.sender_id !== currentUser;
    });
    return reply.status(200).send({data: chats.data});
}

function handleSocket(socket, request) {
    const userid = request.user_id

    if (!CONNECTIONS.addUser(socket, userid))
        return ;

    console.log("ya hala ya welcome md id: ", userid);
}


function apiRoutes(fastify, options, done)
{
    fastify.addHook("preHandler", verifyRequestToken);

    fastify.post("/auth/signup", handleSignUp);
    fastify.post("/auth/login", handleLogIn);
    fastify.post("/auth/recovery", sendRecovery);
    fastify.post("/auth/resetpass", handleAccountReset);
    fastify.post("/auth/twofa", handletwoFa);
    fastify.get("/auth/verifyserial", verifySerial);
    fastify.get("/auth/logout", handleLogout);

    fastify.get("/sessionData", fetchSessionData);
    fastify.get("/picture/:userId", fetchProfilePicture);
    fastify.get("/stats", fetchDashBoardStats);
    fastify.get("/users/:userId", fetchUserData);
    fastify.get("/search/:query", handleSearch);
    fastify.get("/friends", fetchUserFriends);
    fastify.post("/relations", handleUsersRelations);
    fastify.get("/chats", fetchUserChats);

    fastify.get("/websocket", { websocket: true }, handleSocket);

    done();
}

export default apiRoutes;