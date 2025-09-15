import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketIO } from './server';

const httpServer = createServer();
const io = new Server(httpServer, {
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

setupSocketIO(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
