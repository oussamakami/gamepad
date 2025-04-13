import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import apiRoutes from './apiModules.js'
import Dotenv from 'dotenv';

Dotenv.config();
const PORT = process.env.PORT;
const fastify = Fastify();

fastify.register(fastifyCookie);
fastify.register(fastifyCors, {origin: "http://127.0.0.1:5500", credentials: true});
fastify.register(apiRoutes, { prefix: "/api"});

// function reportError(requestPacket, error){
//     const requestsession = getSessionTitle(requestPacket);
//     const requestPayload = requestPacket.body;

//     console.error("\n\x1b[31m########## ERROR ##########\x1b[0m");
//     console.error("Error Code: ", error.code);
//     console.error("Error Message: ", error.message);
//     console.error("------------------");
//     console.error("Origin: ", requestsession);
//     console.error("Payload: ", requestPayload);
//     console.error("\x1b[31m###########################\x1b[0m");
// }

const start = async () => {
    try {
        fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log("Server running on http://127.0.0.1:" + PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();