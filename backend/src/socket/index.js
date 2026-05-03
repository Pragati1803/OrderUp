const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Student joins their order room
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 Joined order room: ${orderId}`);
    });

    // Owner joins their canteen room
    socket.on('joinCanteen', (canteen) => {
      socket.join(`canteen_${canteen}`);
      console.log(`🏪 Joined canteen room: ${canteen}`);
    });

    socket.on('leaveOrder', (orderId) => socket.leave(`order_${orderId}`));
    socket.on('leaveCanteen', (canteen) => socket.leave(`canteen_${canteen}`));

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
