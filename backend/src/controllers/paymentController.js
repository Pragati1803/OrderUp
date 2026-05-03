const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { getIO } = require('../socket');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${order.tokenNumber}`,
      notes: { orderId: order._id.toString(), userId: req.user._id.toString() }
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId: rzpOrder.id,
      amount: order.total,
      receipt: rzpOrder.receipt,
    });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      order: { tokenNumber: order.tokenNumber, total: order.total }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'paid' }
    );

    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'pending',
        paymentStatus: 'paid',
        $push: { statusHistory: { status: 'pending', note: 'Payment received' } }
      },
      { new: true }
    );

    // Notify canteen via socket
    const io = getIO();
    io.to(`canteen_${order.canteen}`).emit('newOrder', order);
    io.to(`order_${order._id}`).emit('orderStatusUpdate', {
      orderId: order._id, status: 'pending', tokenNumber: order.tokenNumber
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
