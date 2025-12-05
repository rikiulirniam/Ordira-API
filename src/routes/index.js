import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import menuRoutes from './menuRoutes.js';
import orderRoutes from './orderRoutes.js';

const router = Router();

router.use('/api', authRoutes);
router.use('/api', aiRoutes);
router.use('/api', menuRoutes);
router.use('/api', orderRoutes);

export default router;
