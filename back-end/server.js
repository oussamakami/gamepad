// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.
// THIS IS A PROOF OF CONCEPT; THE ENTIRE CODE IS TEMPORARY AND WILL BE REMOVED IN THE FUTURE.


import Fastify from "fastify";
import sqlite3 from "better-sqlite3";
import cors from "@fastify/cors";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: false });
const db = new sqlite3(path.join(__dirname, "database.db"));


let sql = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password TEXT);";
db.exec(sql);

let adduser = db.prepare("INSERT INTO users (email, password) VALUES (?, ?);");
let getuser = db.prepare("SELECT * FROM users WHERE email = ?;");
let getAlluser = db.prepare("SELECT * FROM users;");


console.log(getAlluser.all());

// console.log(getuser.get("user@user.com"));



// Register CORS plugin to allow frontend requests
fastify.register(cors, {origin: "*"});

fastify.post("/api/login", async (request, reply) => {
    const { email, password } = request.body;

    console.log("\nLOGIN:");
    console.log(request.body);
    if (!email || !password) {
        return reply.status(400).send({ error: "Invalid Request" });
    }

    const dbUser = getuser.get(email);

    if (!dbUser || !(email === dbUser.email && password === dbUser.password))
        return reply.status(401).send({ error: "Invalid credentials" });
    else
        return { message: "Login successful!" };
});

fastify.post("/api/signup", async (request, reply) => {
    const { email, password } = request.body;

    console.log("\nSIGNUP:");
    console.log(request.body);
    if (!email || !password) {
        return reply.status(400).send({ error: "Invalid Request" });
    }

    try {
        const data = adduser.run(email, password);
        return { message: "account created successfuly!" };
    }
    catch(err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
            return reply.status(400).send({ error: "user already exist" });
        return reply.status(400).send({ error: "Invalid Request" });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: "127.0.0.1" });
        console.log("Server running on http://127.0.0.1:3000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
