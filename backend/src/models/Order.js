const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema({
  tokenNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canteen: {
    type: String,
    enum: ['PSIT 2004', 'Nescafe', 'Amul', 'Samocha', 'Urban Vada Pao', 'Che-Canteen', 'Nescafe-CHE'],
    required: true
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending_payment', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'],
    default: 'pending_payment'
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  estimatedTime: { type: Number, default: 15, comment: 'minutes' },
  queuePosition: { type: Number, default: 0 },
  specialInstructions: { type: String, default: '' },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  completedAt: Date,
}, { timestamps: true });

// Auto generate token number before save
orderSchema.pre('save', async function (next) {
  if (!this.tokenNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const pad = String(count + 1001).padStart(4, '0');
    this.tokenNumber = `ORD${pad}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
