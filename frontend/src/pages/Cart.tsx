import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, tax, total, canteen, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const placeOrder = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const payload = {
        canteen,
        items: items.map(i => ({ menuItemId: i._id, name: i.name, quantity: i.quantity })),
        specialInstructions: note,
      };
      const { data } = await api.post('/orders', payload);
      toast.success('Order created! Proceeding to payment...');
      navigate(`/payment/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (!items.length) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4 text-white/40">
      <ShoppingBag className="w-16 h-16" />
      <p className="text-xl">Your cart is empty</p>
      <Link to="/menu" className="btn-primary">Browse Menu</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/menu" className="text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-display text-3xl text-white">Your Cart</h1>
          <span className="glass px-3 py-1 rounded-full text-sm text-brand-400">📍 {canteen}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item._id} layout exit={{ opacity: 0, x: -20 }}
                  className="glass rounded-2xl p-4 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{item.name}</h3>
                    <p className="text-brand-400 text-sm font-semibold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item._id, item.quantity - 1)}
                      className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)}
                      className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white hover:bg-brand-600 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-white font-semibold w-16 text-right">₹{item.price * item.quantity}</div>
                  <button onClick={() => removeItem(item._id)}
                    className="text-red-400/60 hover:text-red-400 transition-colors ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="glass rounded-2xl p-4">
              <label className="block text-sm text-white/60 mb-2">Special Instructions (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                className="input-dark w-full text-sm resize-none" placeholder="No onions, extra spicy, etc." />
            </div>
          </div>

          <div className="glass rounded-2xl p-6 h-fit sticky top-24 space-y-4">
            <h2 className="text-white font-semibold text-lg">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/60"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-white/60"><span>Tax (5%)</span><span>₹{tax}</span></div>
              <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                <span>Total</span><span className="text-brand-400">₹{total}</span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Placing...' : `Pay ₹${total}`}
            </button>
            <p className="text-xs text-white/30 text-center">Secured by Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
