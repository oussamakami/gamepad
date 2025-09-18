import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastifyMultipart from '@fastify/multipart';
import apiRoutes from './apiModules.js';
import Dotenv from 'dotenv';
import os from 'os';

Dotenv.config();
const PORT = process.env.PORT;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 2097152;
const fastify = Fastify();

fastify.register(fastifyCookie);
fastify.register(fastifyWebsocket);
fastify.register(fastifyCors, {origin: FRONTEND_ORIGIN, credentials: true});
fastify.register(fastifyMultipart, {limits: {fileSize: MAX_FILE_SIZE, files: 1}});
fastify.register(apiRoutes, { prefix: "/api"});

process.on('SIGINT', () => {
    console.log('\nServer shutting down gracefully...');
    process.exit(0);
});

const networkIPs = () => {
  const interfaces = os.networkInterfaces();
  return Object.values(interfaces)
    .flat()
    .filter(i => i.family === 'IPv4' && !i.internal)
    .map(i => i.address);
}

const start = async () => {
    try {
        fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`\x1b[36mAPI Server running\x1b[0m:`);
        console.log(`\t- \x1b[32mAPI Local\x1b[0m  :\thttp://127.0.0.1:${PORT}`);
        networkIPs().forEach(ip => console.log(`\t- \x1b[32mAPI Network\x1b[0m:\thttp://${ip}:${PORT}`));
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();