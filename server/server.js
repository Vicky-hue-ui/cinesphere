const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

