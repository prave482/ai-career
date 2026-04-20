import { Router } from 'express';
import { getDatabaseStatus } from '../utils/database';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      database: getDatabaseStatus(),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
