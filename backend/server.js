const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:4173',
    ].filter(Boolean);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      // In production, allow all origins for simplicity — tighten as needed
      callback(null, true);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Default Route
app.get('/', (req, res) => {
  res.send('DSA Pattern Tracker AI API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
