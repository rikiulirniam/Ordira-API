import { Router } from 'express';
import {
  createNewOrder,
  getOrder,
  getTableOrders,
  listOrders,
  updateOrder,
  updatePayment,
  cancelOrderController,
  getOrderStats,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public endpoints
router.post('/orders', createNewOrder);
router.get('/orders/:id', getOrder);
router.get('/orders/table/:tableNumber', getTableOrders);
router.post('/orders/:id/cancel', cancelOrderController);

// Protected endpoints - Admin/Kasir only
router.get('/orders', authenticate, authorize(['ADMIN', 'KASIR']), listOrders);
router.patch('/orders/:id/status', authenticate, authorize(['ADMIN', 'KASIR']), updateOrder);
router.patch('/orders/:id/payment', authenticate, authorize(['ADMIN', 'KASIR']), updatePayment);
router.get('/orders/stats/summary', authenticate, authorize(['ADMIN']), getOrderStats);

export default router;
