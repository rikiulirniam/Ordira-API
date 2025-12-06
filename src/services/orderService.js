import { prisma } from '../models/prismaClient.js';

/**
 * Create a new order
 */
export async function createOrder({ tableNumber, items, paymentMethod = 'NONE', customerEmail }) {
  // Validate items
  if (!items || items.length === 0) {
    throw new Error('Order must have at least one item');
  }

  // Get menu details and calculate total
  const menuIds = items.map(item => item.menuId);
  const menus = await prisma.menu.findMany({
    where: {
      id: { in: menuIds },
      isAvailable: true,
    },
  });

  if (menus.length !== menuIds.length) {
    throw new Error('Some menu items are not available');
  }

  // Calculate subtotals and total
  let total = 0;
  const orderItems = items.map(item => {
    const menu = menus.find(m => m.id === item.menuId);
    if (!menu) {
      throw new Error(`Menu with id ${item.menuId} not found`);
    }
    
    const subtotal = menu.price * item.qty;
    total += subtotal;

    return {
      menuId: item.menuId,
      qty: item.qty,
      subtotal,
      note: item.note || null, // Include note
    };
  });

  // Create order with items
  const order = await prisma.order.create({
    data: {
      tableNumber,
      customerEmail,
      paymentMethod,
      paymentStatus: 'UNPAID',
      total,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          menu: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return order;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menu: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}

/**
 * Get all orders by table number
 */
export async function getOrdersByTable(tableNumber) {
  const orders = await prisma.order.findMany({
    where: { tableNumber },
    include: {
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

/**
 * Get all orders with filters
 */
export async function getAllOrders({ paymentStatus, limit = 50, offset = 0 }) {
  const where = {};
  
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    limit,
    offset,
  };
}
/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId, paymentStatus, paymentMethod) {
  const validStatuses = ['UNPAID', 'PAID', 'CANCELLED'];
  
  if (!validStatuses.includes(paymentStatus)) {
    throw new Error(`Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updateData = { paymentStatus };
  
  if (paymentMethod) {
    updateData.paymentMethod = paymentMethod;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return order;
}


/**
 * Cancel order
 */
export async function cancelOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    throw new Error('Cannot cancel a paid order');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'CANCELLED',
    },
    include: {
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return updatedOrder;
}

/**
 * Add payment log
 */
export async function addPaymentLog(orderId, { method, status, detail }) {
  const paymentLog = await prisma.paymentLog.create({
    data: {
      orderId,
      method,
      status,
      detail,
    },
  });

  return paymentLog;
}

export default {
  createOrder,
  getOrderById,
  getOrdersByTable,
  getAllOrders,
  updatePaymentStatus,
  cancelOrder,
  addPaymentLog,
};