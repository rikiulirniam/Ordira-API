import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import {
  createOrder,
  getOrderById,
  getOrdersByTable,
  getAllOrders,
  updatePaymentStatus,
  cancelOrder,
  addPaymentLog,
} from '../services/orderService.js';

/**
 * Create new order - Public endpoint
 */
export const createNewOrder = async (req, res, next) => {
  try {
    const { tableNumber, items, paymentMethod, customerEmail } = req.body;

    if (!tableNumber) {
      return next(new ApiError(400, 'Table number is required'));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, 'Items array is required and must not be empty'));
    }

    // Validate items structure
    for (const item of items) {
      if (!item.menuId || !item.qty) {
        return next(new ApiError(400, 'Each item must have menuId and qty'));
      }
      if (item.qty <= 0) {
        return next(new ApiError(400, 'Quantity must be greater than 0'));
      }
    }

    const order = await createOrder({ tableNumber, items, paymentMethod, customerEmail });
    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to create order'));
  }
};

/**
 * Get order by ID - Public endpoint
 */
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(parseInt(id));
    return successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    if (error.message === 'Order not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to get order'));
  }
};

/**
 * Get orders by table number - Public endpoint
 */
export const getTableOrders = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;
    const orders = await getOrdersByTable(tableNumber);
    return successResponse(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get orders'));
  }
};

/**
 * Get all orders with filters - Admin/Kasir only
 */
export const listOrders = async (req, res, next) => {
  try {
    const { paymentStatus, limit, offset } = req.query;
    
    const result = await getAllOrders({
      paymentStatus,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
    
    return successResponse(res, result, 'Orders retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get orders'));
  }
};

/**
 * Update payment status - Admin/Kasir only
 */
export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    if (!paymentStatus) {
      return next(new ApiError(400, 'Payment status is required'));
    }

    const order = await updatePaymentStatus(parseInt(id), paymentStatus, paymentMethod);
    
    // Create payment log
    if (paymentStatus === 'PAID') {
      await addPaymentLog(parseInt(id), {
        method: paymentMethod || order.paymentMethod,
        status: 'SUCCESS',
        detail: {
          updatedBy: req.user?.id || null,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return successResponse(res, order, 'Payment status updated successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to update payment'));
  }
};

/**
 * Cancel order - Public endpoint (before paid) or Admin
 */
export const cancelOrderController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await cancelOrder(parseInt(id));
    return successResponse(res, order, 'Order cancelled successfully');
  } catch (error) {
    if (error.message.includes('Cannot cancel')) {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to cancel order'));
  }
};

/**
 * Get order statistics - Admin only
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const { prisma } = await import('../models/prismaClient.js');
    
    const [
      totalOrders,
      unpaidOrders,
      paidOrders,
      cancelledOrders,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'UNPAID' } }),
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { paymentStatus: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { total: true },
      }),
    ]);

    const stats = {
      totalOrders,
      ordersByPaymentStatus: {
        unpaid: unpaidOrders,
        paid: paidOrders,
        cancelled: cancelledOrders,
      },
      todayRevenue: todayRevenue._sum.total || 0,
    };

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get statistics'));
  }
};