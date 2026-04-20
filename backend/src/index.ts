import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import careerRoutes from './routes/career';
import healthRoutes from './routes/health';
import { connectDatabase } from './utils/database';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Career Copilot backend is running.',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/career', careerRoutes);
app.use(errorHandler);

connectDatabase().finally(() => {
  app.listen(port, () => {
    console.log(`AI Career Copilot API listening on port ${port}`);
  });
});
