import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketIO } from './server';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

setupSocketIO(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
