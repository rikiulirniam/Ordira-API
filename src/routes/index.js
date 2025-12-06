import { Router } from 'express';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import menuRoutes from './menuRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import kasirRoutes from './kasirRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import menuManagementRoutes from './menuManagementRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Public routes first (no auth required)
router.use('/api', authRoutes);
router.use('/api', aiRoutes);
router.use('/api', menuRoutes);
router.use('/api', orderRoutes);
router.use('/api', paymentRoutes);
router.use('/api', kasirRoutes);

// Admin routes last (require auth)
router.use('/api', categoryRoutes);
router.use('/api', menuManagementRoutes);
router.use('/api', userRoutes);

export default router;
