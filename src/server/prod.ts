import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      "https://onmangeou-six.vercel.app",
      "https://onmangeou-git-main-youplala.vercel.app", 
      /\.vercel\.app$/,
      process.env.FRONTEND_URL
    ].filter(Boolean) as (string | RegExp)[]
  : "*";

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  time: string;
  color?: string;
  type?: 'vote' | 'chat';
}

interface User {
  id: string;
  name: string;
  color: string;
  restaurantIndex: number;
  online: boolean;
}

interface LeaderboardEntry {
  votes: number;
  voters: User[];
}

interface RoomState {
  users: User[];
  chatHistory: ChatMessage[];
  leaderboard: Record<string, LeaderboardEntry>;
}

const rooms: Record<string, RoomState> = {};

const userColors = [
  '#D32F2F', '#388E3C', '#1976D2', '#D81B60', '#8E24AA', '#00796B',
  '#F57C00', '#C2185B', '#512DA8', '#0288D1', '#FFA000', '#689F38'
];

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  console.log('Origin:', socket.handshake.headers.origin);

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`${userName} joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        chatHistory: [],
        leaderboard: {}
      };
    }

    const existingUser = rooms[roomId].users.find(u => u.name === userName);
    if (existingUser) {
      existingUser.online = true;
      existingUser.id = socket.id;
    } else {
      const newUser: User = {
        id: socket.id,
        name: userName,
        color: userColors[rooms[roomId].users.length % userColors.length],
        restaurantIndex: 0,
        online: true
      };
      rooms[roomId].users.push(newUser);
    }

    socket.emit('room-state', {
      users: rooms[roomId].users,
      chatHistory: rooms[roomId].chatHistory,
      leaderboard: rooms[roomId].leaderboard
    });

    socket.to(roomId).emit('user-joined', rooms[roomId].users);
  });

  socket.on('send-message', ({ roomId, userName, message }) => {
    if (!rooms[roomId]) return;

    const chatMessage: ChatMessage = {
      id: Date.now(),
      user: userName,
      text: message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'chat'
    };

    rooms[roomId].chatHistory.push(chatMessage);
    io.to(roomId).emit('new-message', chatMessage);
  });

  socket.on('vote', ({ roomId, userName, restaurantName, vote }) => {
    if (!rooms[roomId]) return;

    const user = rooms[roomId].users.find(u => u.name === userName);
    if (!user) return;

    if (!rooms[roomId].leaderboard[restaurantName]) {
      rooms[roomId].leaderboard[restaurantName] = { votes: 0, voters: [] };
    }

    const entry = rooms[roomId].leaderboard[restaurantName];
    const hasVoted = entry.voters.some(v => v.name === userName);

    if (vote === 'OUI' && !hasVoted) {
      entry.votes++;
      entry.voters.push(user);

      const voteMessage: ChatMessage = {
        id: Date.now(),
        user: userName,
        text: `a voté pour ${restaurantName} 👍`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'vote'
      };

      rooms[roomId].chatHistory.push(voteMessage);
      io.to(roomId).emit('new-message', voteMessage);
    }

    user.restaurantIndex++;
    io.to(roomId).emit('leaderboard-update', rooms[roomId].leaderboard);
    socket.to(roomId).emit('user-update', rooms[roomId].users);
  });

  socket.on('opt-out', ({ roomId, userName }) => {
    if (!rooms[roomId]) return;

    const user = rooms[roomId].users.find(u => u.name === userName);
    if (user) {
      user.restaurantIndex = 999;
      socket.to(roomId).emit('user-update', rooms[roomId].users);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    
    Object.keys(rooms).forEach(roomId => {
      const user = rooms[roomId].users.find(u => u.id === socket.id);
      if (user) {
        user.online = false;
        socket.to(roomId).emit('user-update', rooms[roomId].users);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
