import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  aiApiUrl: process.env.AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  aiTimeout: parseInt(process.env.AI_TIMEOUT || '15000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

export function isDemoMode(): boolean {
  return !config.mongoUri;
}

export function isAiConfigured(): boolean {
  return !!config.aiApiKey;
}
