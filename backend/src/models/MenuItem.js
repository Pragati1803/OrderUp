const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
  category: {
    type: String,
    enum: ['Snacks', 'Meals', 'Drinks', 'Desserts', 'Breakfast', 'Fast Food', 'Healthy'],
    required: true
  },
  canteen: {
    type: String,
    enum: ['PSIT 2004', 'Nescafe', 'Amul', 'Samocha', 'Urban Vada Pao', 'Che-Canteen', 'Nescafe-CHE'],
    required: true
  },
  isAvailable: { type: Boolean, default: true },
  prepTime: { type: Number, default: 10, comment: 'in minutes' },
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  isVeg: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
