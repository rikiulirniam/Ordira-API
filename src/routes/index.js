import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import menuRoutes from './menuRoutes.js';

const router = Router();

router.use('/api', authRoutes);
router.use('/api', aiRoutes);
router.use('/api', menuRoutes);

export default router;
