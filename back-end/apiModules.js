import inputValidator from './inputValidator.js';
import userData from './database.js'

const database = new userData("", true);

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
    
    const queryResponse = database.fetchUser(userIdentifier);

    if (queryResponse.success) {
        if (queryResponse.data.password === password) {
            const session = database.createSession(queryResponse.data.id, rememberSession, getSessionInfo(request));
            reply.setCookie("authToken", session.data.token, {path: "/", priority: "High"});
            return reply.status(200).send({message: "Login successful!", id: queryResponse.data.id,
                username: queryResponse.data.username, email: queryResponse.data.email});
        }
        else
            return reply.status(403).send({error: "Incorrect username or password"});
    }
    if (!queryResponse.error.code)
        return reply.status(403).send({error: "Incorrect username or password"});
    return reply.status(500).send({error: "Internal Server Error"});
}

function apiRoutes(fastify, options, done)
{
    fastify.addHook("preHandler", verifyRequestToken);
    fastify.post("/signup", handleSignUp);
    fastify.post("/login", handleLogIn);



    done();
}

export default apiRoutes;