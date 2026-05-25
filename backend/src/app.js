import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import classRoutes from './routes/classRoutes.js';
import assignmentRoutes from './routes/AssignmentRoutes.js';
import razorpayRouter from './routes/razorpayRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store connected users
const connectedUsers = new Map();

// Debug function to log connected users
const logConnectedUsers = () => {
  console.log('Current connected users:');
  connectedUsers.forEach((socketId, userId) => {
    console.log(`User ${userId} -> Socket ${socketId}`);
  });
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  
  console.log('New socket connection attempt');
  console.log('Socket ID:', socket.id);
  console.log('User ID from query:', userId);
  
  if (userId) {
    // Store the user's socket connection
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
    logConnectedUsers();
    
    // Send confirmation to the client
    socket.emit('connection_success', {
      message: 'Successfully connected to notification service',
      userId: userId
    });
  } else {
    console.log('Connection attempt without user ID');
  }

  // Handle disconnection
  socket.on('disconnect', () => {
    if (userId) {
      console.log(`User ${userId} disconnected from socket ${socket.id}`);
      connectedUsers.delete(userId);
      logConnectedUsers();
    }
  });

  // Handle explicit connection request
  socket.on('register_user', (data) => {
    const registeredUserId = data.userId;
    if (registeredUserId) {
      connectedUsers.set(registeredUserId, socket.id);
      console.log(`User ${registeredUserId} registered with socket ${socket.id}`);
      logConnectedUsers();
      
      socket.emit('registration_success', {
        message: 'Successfully registered for notifications',
        userId: registeredUserId
      });
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error for user', userId, ':', error);
  });
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/razorpay', razorpayRouter);
app.use('/api/order', orderRoutes);

const PORT = process.env.PORT || 8000;

// Export io instance and connected users map
export const getIO = () => io;
export const getConnectedUsers = () => connectedUsers;

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('WebSocket server is ready for connections');
});