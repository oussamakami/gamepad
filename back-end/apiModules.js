import inputValidator from './inputValidator.js';
import userData from './database.js'
import { readFile } from 'fs/promises'
import { join } from 'path';
import Dotenv from 'dotenv';

Dotenv.config();
const VALIDEXT = ["png", "jpg", "jpeg", "webp"];
const PICTURES_PATH = process.env.PICTURES_PATH;
const database = new userData("", false);

//generate random data for testing

import RecordGenerator from './randomGenerator.js';

const numberOfUsersToGenerate = 39;
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
    if (request.url.endsWith("/login") || request.url.endsWith("/signup"))
        return (next());

    const sessionToken = request.cookies.authToken;
    const verification = database.verifySession(sessionToken);

    if (!verification.success)
        return reply.status(401).send({error: "Unauthorized Access"});

    request.user = verification.data.user_id;
    request.token_id = verification.data.token_id;

    next();
}

function handleSignUp(request, reply) {
    const username = request.body.username;
    const password = request.body.password;
    const useTerms = request.body.useTerms;
    const email = inputValidator.normalizeEmail(request.body.email)

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

    const queryResponse = database.checkCredentials(userIdentifier, password);

    if (queryResponse.success) {
        const session = database.createSession(queryResponse.data.id, rememberSession, getSessionInfo(request));

        reply.setCookie("authToken", session.data.token, {path: "/", priority: "High"});
        return reply.status(200).send({message: "Login successful!", ...queryResponse.data});
    }
    if (!queryResponse.error.code)
        return reply.status(403).send({error: queryResponse.error.message});
    return reply.status(500).send({error: "Internal Server Error"});
}

function fetchSessionData(request, reply) {
    const queryResponse = database.fetchUser(request.user);

    if (!queryResponse.success)
        return reply.status(401).send({error: "Unauthorized Access"});

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
    const queryResponse = database.fetchUser(request.params.userId);
    
    if (!queryResponse.success)
        reply.status(404).send({error: queryResponse.error.message});

    const relation = database.fetchFriendshipData(request.user, queryResponse.data.id);

    if (relation && relation.status === 'blocked')
        reply.status(404).send({error: "User does not exist"});
    
    const stats = database.fetchUserGlobalStats(queryResponse.data.id);

    if (!stats.success)
        return reply.status(500).send({error: "Internal Server Error"});
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

    if (!success)
        return reply.status(500).send({error: "Internal Server Error"});
    return reply.status(200).send({message: "Logged out Successfully"});
}


function apiRoutes(fastify, options, done)
{
    fastify.addHook("preHandler", verifyRequestToken);
    fastify.post("/signup", handleSignUp);
    fastify.post("/login", handleLogIn);
    fastify.get("/sessionData", fetchSessionData);
    fastify.get("/picture/:userId", fetchProfilePicture);
    fastify.get("/stats", fetchDashBoardStats);
    fastify.get("/users/:userId", fetchUserData);
    fastify.get("/logout", handleLogout);

    done();
}

export default apiRoutes;