"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
const rooms = {};
const userColors = [
    '#D32F2F', '#388E3C', '#1976D2', '#D81B60', '#8E24AA', '#00796B',
    '#F57C00', '#C2185B', '#512DA8', '#0288D1', '#FFA000', '#689F38'
];
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join-room', ({ roomId, userName }) => {
        socket.join(roomId);
        console.log(`${userName} joined room ${roomId}`);
        if (!rooms[roomId]) {
            rooms[roomId] = { users: [], chatHistory: [], leaderboard: {} };
        }
        let user = rooms[roomId].users.find(u => u.name === userName);
        if (user) {
            // User is reconnecting, update socket ID and set online
            user.id = socket.id;
            user.online = true;
        }
        else {
            // New user, assign color and initialize
            const assignedColors = rooms[roomId].users.map(u => u.color);
            const availableColor = userColors.find(c => !assignedColors.includes(c)) || userColors[0];
            user = {
                id: socket.id,
                name: userName,
                color: availableColor,
                restaurantIndex: 0,
                online: true,
            };
            rooms[roomId].users.push(user);
        }
        // Send history and state to the connecting client
        socket.emit('chat-history', rooms[roomId].chatHistory);
        socket.emit('update-leaderboard', rooms[roomId].leaderboard);
        // Update everyone's user list
        io.to(roomId).emit('update-user-list', rooms[roomId].users);
    });
    socket.on('chat-message', ({ roomId, message }) => {
        const room = rooms[roomId];
        if (!room)
            return;
        const user = room.users.find((u) => u.name === message.user);
        if (user) {
            message.color = user.color;
        }
        room.chatHistory.push(message);
        io.to(roomId).emit('chat-message', message);
    });
    socket.on('vote', ({ roomId, userName, restaurantName, vote }) => {
        const user = rooms[roomId].users.find(u => u.name === userName);
        if (user) {
            // Advance the user's personal restaurant index
            user.restaurantIndex++;
            io.to(roomId).emit('update-user-list', rooms[roomId].users);
        }
        if (vote === 'OUI') {
            if (!rooms[roomId].leaderboard[restaurantName]) {
                rooms[roomId].leaderboard[restaurantName] = { votes: 0, voters: [] };
            }
            rooms[roomId].leaderboard[restaurantName].votes++;
            if (user && !rooms[roomId].leaderboard[restaurantName].voters.some(v => v.id === user.id)) {
                rooms[roomId].leaderboard[restaurantName].voters.push(user);
            }
            io.to(roomId).emit('update-leaderboard', rooms[roomId].leaderboard);
        }
        const voteMessage = {
            id: Date.now(),
            user: userName,
            text: `a voté ${vote} pour ${restaurantName}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'vote',
        };
        rooms[roomId].chatHistory.push(voteMessage);
        io.to(roomId).emit('chat-message', voteMessage);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        for (const roomId in rooms) {
            const user = rooms[roomId].users.find((user) => user.id === socket.id);
            if (user) {
                user.online = false;
                io.to(roomId).emit('update-user-list', rooms[roomId].users);
                break; // A user can only be in one room, so we can stop looking.
            }
        }
    });
});
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
