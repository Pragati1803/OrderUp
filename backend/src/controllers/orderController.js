const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { getIO } = require('../socket');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { canteen, items, specialInstructions } = req.body;

    // Validate & enrich items from DB
    let subtotal = 0;
    const enriched = [];
    for (const item of items) {
      const mi = await MenuItem.findById(item.menuItemId);
      if (!mi || !mi.isAvailable) return res.status(400).json({ error: `${item.name || 'Item'} is unavailable` });
      const qty = item.quantity || 1;
      subtotal += mi.price * qty;
      enriched.push({ menuItem: mi._id, name: mi.name, price: mi.price, quantity: qty, image: mi.image });
    }

    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    // Estimate prep time: max prepTime among items + 5 min buffer
    const itemIds = enriched.map(i => i.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } });
    const maxPrep = Math.max(...menuItems.map(mi => mi.prepTime || 10));
    const estimatedTime = maxPrep + 5;

    // Queue position: count active orders for this canteen
    const queuePos = await Order.countDocuments({ canteen, status: { $in: ['pending', 'accepted', 'preparing'] } });

    const order = await Order.create({
      user: req.user._id,
      canteen,
      items: enriched,
      subtotal,
      tax,
      total,
      estimatedTime,
      queuePosition: queuePos + 1,
      specialInstructions,
      statusHistory: [{ status: 'pending_payment', note: 'Order created' }]
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'student') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/canteen  (owner)
exports.getCanteenOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { canteen: req.user.canteen };
    if (status) filter.status = status;
    else filter.status = { $in: ['pending', 'accepted', 'preparing', 'ready'] };

    const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: 1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/orders/:id/status  (owner)
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['accepted', 'preparing', 'ready', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await Order.findOne({ _id: req.params.id, canteen: req.user.canteen });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (status === 'completed') order.completedAt = new Date();
    await order.save();

    // Emit real-time update
    const io = getIO();
    io.to(`order_${order._id}`).emit('orderStatusUpdate', { orderId: order._id, status, tokenNumber: order.tokenNumber });
    io.to(`canteen_${order.canteen}`).emit('orderUpdate', order);

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
