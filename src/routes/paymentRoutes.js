import { Router } from 'express';
import {
  createPayment,
  handlePaymentNotification,
  checkPaymentStatus,
} from '../controllers/paymentController.js';

const router = Router();

// Public endpoints
router.post('/payment/create', createPayment);
router.post('/payment/notification', handlePaymentNotification); // Midtrans webhook
router.get('/payment/status/:orderId', checkPaymentStatus);

export default router;
