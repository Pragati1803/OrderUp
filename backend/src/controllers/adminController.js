const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Payment = require('../models/Payment');

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const canteen = req.user.role === 'owner' ? req.user.canteen : req.query.canteen;
    const filter = canteen ? { canteen } : {};
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, completedOrders, revenue] = await Promise.all([
      Order.countDocuments(filter),
      Order.countDocuments({ ...filter, createdAt: { $gte: today } }),
      Order.countDocuments({ ...filter, status: 'completed' }),
      Order.aggregate([
        { $match: { ...filter, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Popular items
    const popularItems = await Order.aggregate([
      { $match: { ...filter, status: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Daily orders (last 7 days)
    const daily = await Order.aggregate([
      { $match: { ...filter, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalOrders,
        todayOrders,
        completedOrders,
        totalRevenue: revenue[0]?.total || 0,
        completionRate: totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0
      },
      popularItems,
      daily
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
