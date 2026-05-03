const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
  canteen: {
    type: String,
    enum: ['PSIT 2004', 'Nescafe', 'Amul', 'Samocha', 'Urban Vada Pao', 'Che-Canteen', 'Nescafe-CHE'],
    default: null
  },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
