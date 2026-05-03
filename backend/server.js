

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://order-up-frontend-gray.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

// Routes
app.use('/api/auth',    require('./src/routes/auth'));
app.use('/api/menu',    require('./src/routes/menu'));
app.use('/api/orders',  require('./src/routes/orders'));
app.use('/api/payment', require('./src/routes/payment'));
app.use('/api/admin',   require('./src/routes/admin'));
app.use('/api/chat',    require('./src/routes/chat'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'OrderUp API' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 OrderUp server running on port ${PORT}`));

module.exports = server;
