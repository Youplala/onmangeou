import { Server } from 'socket.io';

// --- TYPES ---
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
  hasOptedOut?: boolean;
}

interface LeaderboardEntry {
  votes: number;
  voters: User[];
}

interface RoomState {
  users: User[];
  chatHistory: ChatMessage[];
  leaderboard: Record<string, LeaderboardEntry>;
  roomStartTime?: string;
  restaurantSet?: any[];
}

const rooms: Record<string, RoomState> = {};

const userColors = [
  '#D32F2F', '#388E3C', '#1976D2', '#D81B60', '#8E24AA', '#00796B',
  '#F57C00', '#C2185B', '#512DA8', '#0288D1', '#FFA000', '#689F38'
];

export function setupSocketIO(io: Server) {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join-room', ({ roomId, userName }) => {
      socket.join(roomId);
      console.log(`${userName} joined room ${roomId}`);

      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: [],
          chatHistory: [],
          leaderboard: {},
          roomStartTime: new Date().toISOString()
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
          online: true,
          hasOptedOut: false
        };
        rooms[roomId].users.push(newUser);
      }

      socket.emit('room-state', {
        users: rooms[roomId].users,
        chatHistory: rooms[roomId].chatHistory,
        leaderboard: rooms[roomId].leaderboard,
        roomStartTime: rooms[roomId].roomStartTime,
        restaurantSet: rooms[roomId].restaurantSet
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
      if (!user || user.hasOptedOut) return;

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
      io.to(roomId).emit('user-update', rooms[roomId].users);
    });

    socket.on('user-opt-out', ({ roomId, userName }) => {
      if (!rooms[roomId]) return;

      const user = rooms[roomId].users.find(u => u.name === userName);
      if (user) {
        user.hasOptedOut = true;
        io.to(roomId).emit('user-update', rooms[roomId].users);
      }
    });

    socket.on('set-room-start-time', ({ roomId, startTime }) => {
      if (!rooms[roomId]) return;
      rooms[roomId].roomStartTime = startTime;
    });

    socket.on('set-restaurant-set', ({ roomId, restaurantSet }) => {
      if (!rooms[roomId]) return;
      if (!rooms[roomId].restaurantSet) {
        rooms[roomId].restaurantSet = restaurantSet;
        io.to(roomId).emit('restaurant-set-update', restaurantSet);
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
}
