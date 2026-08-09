import "./env.js";
import http from "http";
import https from "https";
import fs from "fs";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import app from "./src/app.js";
import prisma from "./config/dbConfig.js";

const PORT = process.env.PORT;

/* ==========================================
   SERVER CONFIGURATION

   LOCAL:
   const USE_HTTPS = true;

   RENDER / NGINX:
   const USE_HTTPS = false;
========================================== */

const USE_HTTPS = true;

let server;

if (USE_HTTPS) {
  console.log("Running in LOCAL mode (HTTPS)");

  const sslOptions = {
    key: fs.readFileSync("./cert/server.key"),
    cert: fs.readFileSync("./cert/server.crt"),
  };

  server = https.createServer(sslOptions, app);
} else {
  console.log("Running in PRODUCTION mode (HTTP)");

  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    // Check auth object (standard), then query params, then headers (for easier Postman testing)
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]);

    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

const activeUsers = new Map();

io.on("connection", (socket) => {
  const user = socket.user;
  const userKey = user.employeeId || user.id;

  console.log(`User ${userKey} connected`);

  activeUsers.set(userKey, {
    id: user.id,
    employeeId: user.employeeId,
    roleName: user.roleName,
    fullName: user.fullName,
    socketId: socket.id,
    connectedAt: new Date().toISOString(),
  });

  io.emit("activeUsers", Array.from(activeUsers.values()));

  socket.on("disconnect", () => {
    console.log(`User ${userKey} disconnected`);
    activeUsers.delete(userKey);
    io.emit("activeUsers", Array.from(activeUsers.values()));
  });
});

app.set("io", io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`${USE_HTTPS ? "HTTPS" : "HTTP"} Server running on port ${PORT}`);
});

export { io };
