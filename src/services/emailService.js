import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Generate receipt HTML
 */
function generateReceiptHTML(order) {
  const itemsHTML = order.items
    .map(
      item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.menu.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${item.menu.price.toLocaleString('id-ID')}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
    </tr>
    ${item.note ? `<tr><td colspan="4" style="padding: 4px 8px; font-size: 12px; color: #666; font-style: italic;">Note: ${item.note}</td></tr>` : ''}
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - Order #${order.id}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0 0 10px 0;">Ordira Restaurant</h1>
        <p style="margin: 0; color: #7f8c8d;">Payment Receipt</p>
      </div>
      
      <div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Order ID:</strong></td>
            <td style="padding: 8px 0; text-align: right;">#${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Table Number:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${order.tableNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Date:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${new Date(order.createdAt).toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Payment Method:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Status:</strong></td>
            <td style="padding: 8px 0; text-align: right;"><span style="background-color: #28a745; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;">${order.paymentStatus}</span></td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
              <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8f9fa;">
              <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; border-top: 2px solid #dee2e6;">TOTAL</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #dee2e6;">Rp ${order.total.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p style="margin: 0;">Thank you for your order!</p>
        <p style="margin: 5px 0 0 0;">For any inquiries, please contact us.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send receipt email
 */
export async function sendReceiptEmail(order, customerEmail) {
  if (!customerEmail) {
    throw new Error('Customer email is required');
  }

  const mailOptions = {
    from: `"Ordira Restaurant" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Payment Receipt - Order #${order.id}`,
    html: generateReceiptHTML(order),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Receipt email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send receipt email');
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    return { success: true, message: 'Email server is ready' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, message: error.message };
  }
}

export default {
  sendReceiptEmail,
  verifyEmailConfig,
};
