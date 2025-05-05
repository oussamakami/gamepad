import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastifyMultipart from '@fastify/multipart';
import apiRoutes from './apiModules.js'
import Dotenv from 'dotenv';

Dotenv.config();
const PORT = process.env.PORT;
const fastify = Fastify();

fastify.register(fastifyCookie);
fastify.register(fastifyWebsocket);
fastify.register(fastifyCors, {origin: "http://127.0.0.1:5500", credentials: true});
fastify.register(fastifyMultipart, {limits: {fileSize: 2 * 1024 * 1024, files: 1}});
fastify.register(apiRoutes, { prefix: "/api"});

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