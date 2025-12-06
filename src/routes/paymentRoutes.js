import { Router } from 'express';
import {
  createPayment,
  handlePaymentNotification,
  checkPaymentStatus,
} from '../controllers/paymentController.js';

const router = Router();

// Debug middleware to check if route is hit
router.use((req, res, next) => {
  console.log('Payment route hit:', req.method, req.path);
  next();
});

// Public endpoints
router.post('/payment/create', createPayment);
router.post('/payment/notification', handlePaymentNotification); // Midtrans webhook
router.get('/payment/status/:orderId', checkPaymentStatus);

export default router;
