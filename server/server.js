const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load env vars first
dotenv.config();

// Attempt MongoDB connection (non-fatal if unconfigured)
connectDB();

const app = express();

// ── Flexible CORS (allows all localhost/127.0.0.1 ports and configured CLIENT_URL) ──
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any localhost / 127.0.0.1 port in dev
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// ── In-Memory Rate Limiter for AI routes ──────────────────────────────────────
const rateLimitMap = new Map();
const aiRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 40;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  const data = rateLimitMap.get(ip);
  if (now > data.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (data.count >= maxRequests) {
    return res.status(429).json({
      message: 'Too many AI requests. Please wait a minute before asking again.',
    });
  }

  data.count += 1;
  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ── DB Connection Check Middleware for Database Routes ────────────────────────
const requireDatabase = (req, res, next) => {
  if (!process.env.MONGO_URI) {
    return res.status(503).json({
      message:
        'Database is not configured. Please set the MONGO_URI environment variable on Render.',
    });
  }
  if (mongoose.connection.readyState === 0) {
    return res.status(503).json({
      message:
        'Database connection failed. Please ensure MongoDB Atlas Network Access has IP 0.0.0.0/0 whitelisted.',
    });
  }
  // If readyState is 1 (connected) or 2 (connecting), proceed
  next();
};

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', requireDatabase, require('./routes/authRoutes'));
app.use('/api/reviews', requireDatabase, require('./routes/reviewRoutes'));
app.use('/api/watchlist', requireDatabase, require('./routes/watchlistRoutes'));
app.use('/api/diary', requireDatabase, require('./routes/diaryRoutes'));

// AI Routes run independently without requiring MongoDB
app.use('/api/ai', aiRateLimiter, require('./routes/aiRoutes'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({
    status: 'CineSphere API is running',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    gemini: process.env.GEMINI_API_KEY ? 'configured' : 'fallback-mode',
  })
);

// ── Serve React Frontend in Production (if built) ─────────────────────────────
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // If no frontend build found, root route shows API status
  app.get('/', (req, res) =>
    res.json({
      status: 'CineSphere API is running',
      version: '2.0.0',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'fallback-mode',
    })
  );
}

// ── 404 Handler for API routes ────────────────────────────────────────────────
app.use('/api/*', (req, res) =>
  res.status(404).json({ message: `API route ${req.originalUrl} not found` })
);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 CineSphere server running on http://localhost:${PORT}`)
);
