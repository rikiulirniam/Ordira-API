import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false, // Sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Create Midtrans payment transaction
 */
export async function createMidtransTransaction(order) {
  const parameter = {
    transaction_details: {
      order_id: `ORDER-${order.id}-${Date.now()}`,
      gross_amount: order.total,
    },
    customer_details: {
      email: order.customerEmail || 'customer@example.com',
      first_name: `Table ${order.tableNumber}`,
    },
    item_details: order.items.map(item => ({
      id: item.menu.id,
      price: item.menu.price,
      quantity: item.qty,
      name: item.menu.name,
    })),
    callbacks: {
      finish: `${process.env.APP_URL}/payment/finish`,
      error: `${process.env.APP_URL}/payment/error`,
      pending: `${process.env.APP_URL}/payment/pending`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans Error:', error);
    throw new Error('Failed to create payment transaction');
  }
}

/**
 * Handle Midtrans notification/callback
 */
export async function handleMidtransNotification(notification) {
  const statusResponse = await snap.transaction.notification(notification);
  
  const orderId = statusResponse.order_id.split('-')[1]; // Extract order ID
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;

  let paymentStatus = 'UNPAID';

  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      paymentStatus = 'PAID';
    }
  } else if (transactionStatus === 'settlement') {
    paymentStatus = 'PAID';
  } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
    paymentStatus = 'CANCELLED';
  }

  return {
    orderId: parseInt(orderId),
    paymentStatus,
    transactionId: statusResponse.transaction_id,
    paymentType: statusResponse.payment_type,
    transactionTime: statusResponse.transaction_time,
    grossAmount: parseFloat(statusResponse.gross_amount),
  };
}

export default {
  createMidtransTransaction,
  handleMidtransNotification,
};
