import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastifyMultipart from '@fastify/multipart';
import apiRoutes from './apiModules.js';
import fs from 'fs';

const PORT = 3000;
const fastify = Fastify({
    https: {
      key: fs.readFileSync('/www/ssl/ssl.key'),
      cert: fs.readFileSync('/www/ssl/ssl.crt')
    }
  });

fastify.register(fastifyCookie);
fastify.register(fastifyWebsocket);
fastify.register(fastifyCors, {origin: "https://127.0.0.1", credentials: true});
fastify.register(fastifyMultipart, {limits: {fileSize: 2 * 1024 * 1024, files: 1}});
fastify.register(apiRoutes, { prefix: "/api"});

process.on('SIGINT', () => {
  console.log('\nServer shutting down gracefully...');
  process.exit(0);
});

const start = async () => {
    try {
        fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log("Server running on https://127.0.0.1:" + PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();