import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { config, isDemoMode } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many AI requests. Please try again later.' },
});
app.use('/api/leads/:id/explanation', aiLimiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api', routes);

// ── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Database & Server Start ──────────────────────────────────
async function start() {
  if (config.mongoUri) {
    try {
      await mongoose.connect(config.mongoUri);
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.warn('⚠️  MongoDB connection failed. Running in demo mode with in-memory data.');
      console.warn('   Data will not persist between restarts.');
    }
  } else {
    console.log('ℹ️  No MONGODB_URI configured. Running in demo mode with in-memory data.');
    console.log('   Data will not persist between restarts.');
  }

  app.listen(config.port, () => {
    console.log(`\n🚀 Server running on http://localhost:${config.port}`);
    console.log(`   Mode: ${isDemoMode() ? 'DEMO (in-memory)' : 'PRODUCTION (MongoDB)'}`);
    console.log(`   AI: ${config.aiApiKey ? 'Configured' : 'Not configured (using deterministic fallback)'}`);
    console.log(`   CORS: ${config.corsOrigin}\n`);
  });
}

start().catch(console.error);

export { app };
