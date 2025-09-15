"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const server_1 = require("./server");
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? [
                "https://onmangeou.brosset.li",
                "https://onmangeou-six.vercel.app",
                "https://onmangeou-git-main-youplala.vercel.app",
                /\.vercel\.app$/
            ]
            : "*",
    },
});
(0, server_1.setupSocketIO)(io);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
