import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/api', authRoutes);

export default router;
