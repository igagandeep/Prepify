import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import jobsRouter from './routes/jobs.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 30001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobsRouter);

// Health check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Only start a local server outside of Vercel serverless
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
}

export default app;
