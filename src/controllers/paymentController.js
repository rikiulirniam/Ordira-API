import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import { createMidtransTransaction, handleMidtransNotification } from '../services/midtransService.js';
import { getOrderById, updatePaymentStatus, addPaymentLog } from '../services/orderService.js';
import { sendReceiptEmail } from '../services/emailService.js';

/**
 * Create payment transaction
 */
export const createPayment = async (req, res, next) => {
  try {
    const { orderId, customerEmail } = req.body;

    if (!orderId) {
      return next(new ApiError(400, 'Order ID is required'));
    }

    if (!customerEmail) {
      return next(new ApiError(400, 'Customer email is required for e-payment'));
    }

    // Get order details
    const order = await getOrderById(orderId);

    if (order.paymentStatus === 'PAID') {
      return next(new ApiError(400, 'Order already paid'));
    }

    // Update order with customer email
    const { prisma } = await import('../models/prismaClient.js');
    await prisma.order.update({
      where: { id: orderId },
      data: { customerEmail },
    });

    // Create Midtrans transaction
    const payment = await createMidtransTransaction({ ...order, customerEmail });

    return successResponse(res, payment, 'Payment transaction created successfully', 201);
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to create payment'));
  }
};

/**
 * Handle Midtrans notification/webhook
 */
export const handlePaymentNotification = async (req, res, next) => {
  try {
    const notification = req.body;

    // Handle notification
    const paymentResult = await handleMidtransNotification(notification);

    // Update order payment status
    const order = await updatePaymentStatus(
      paymentResult.orderId,
      paymentResult.paymentStatus,
      paymentResult.paymentType.toUpperCase()
    );

    // Add payment log
    await addPaymentLog(paymentResult.orderId, {
      method: paymentResult.paymentType.toUpperCase(),
      status: paymentResult.paymentStatus === 'PAID' ? 'SUCCESS' : 'FAILED',
      detail: {
        transactionId: paymentResult.transactionId,
        transactionTime: paymentResult.transactionTime,
        grossAmount: paymentResult.grossAmount,
      },
    });

    // Send receipt email if payment successful
    if (paymentResult.paymentStatus === 'PAID' && order.customerEmail) {
      try {
        await sendReceiptEmail(order, order.customerEmail);
      } catch (emailError) {
        console.error('Failed to send receipt email:', emailError);
        // Don't fail the entire process if email fails
      }
    }

    return successResponse(res, { message: 'Notification processed successfully' });
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to process notification'));
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(parseInt(orderId));

    return successResponse(res, {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
    });
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to check payment status'));
  }
};
