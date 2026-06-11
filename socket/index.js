import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin for flexibility, can restrict in production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.SOCKET_SERVER_API_KEY || "inkvibe_realtime_secure_key_8f7b2cde7d3e5a1b";

// Map to store: userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      userSockets.set(userId, socket.id);
      console.log(`User connected: ${userId} (Socket: ${socket.id})`);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

// Secure HTTP endpoint for the Next.js server to request notification broadcasts
app.post('/api/broadcast', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized broadcast trigger' });
  }

  const { userId, type, notification } = req.body;
  if (!userId || !type || !notification) {
    return res.status(400).json({ error: 'Missing broadcast details' });
  }

  const targetSocketId = userSockets.get(userId);
  if (targetSocketId) {
    io.to(targetSocketId).emit('notification', { type, notification });
    console.log(`Real-time notification emitted to user: ${userId}`);
    return res.json({ status: 'emitted', online: true });
  }

  return res.json({ status: 'queued', online: false });
});

app.get('/health', (req, res) => {
  res.json({ status: "healthy", connections: userSockets.size });
});

server.listen(PORT, () => {
  console.log(`Real-time Socket.io server listening on port ${PORT}`);
});
