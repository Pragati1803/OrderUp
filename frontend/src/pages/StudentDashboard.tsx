import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Star, LogOut, ChevronRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { Order, STATUS_LABELS, CANTEENS, CANTEEN_EMOJIS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const active = orders.filter(o => !['completed','rejected','cancelled'].includes(o.status));
  const past = orders.filter(o => ['completed','rejected','cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="glass-strong border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="font-display text-2xl text-white">Order<span className="text-gradient">Up</span></Link>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden sm:block">Hey, {user?.name?.split(' ')[0]}! 👋</span>
          <Link to="/menu" className="btn-primary py-2 text-sm">Order Food</Link>
          <button onClick={logout} className="text-white/40 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, icon: <ShoppingBag className="w-5 h-5" /> },
            { label: 'Active', value: active.length, icon: <Clock className="w-5 h-5" /> },
            { label: 'Loyalty Pts', value: user?.loyaltyPoints || 0, icon: <Star className="w-5 h-5" /> },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-brand-500 flex justify-center mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active Orders */}
        {active.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl text-white mb-4">Active Orders</h2>
            <div className="space-y-3">
              {active.map(order => (
                <Link key={order._id} to={`/track/${order._id}`}
                  className="glass rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center">
                    <span className="text-brand-400 font-bold text-sm">{order.tokenNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{order.canteen}</p>
                    <p className="text-white/40 text-sm truncate">{order.items.map(i => i.name).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-3 py-1 rounded-full border status-${order.status}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <p className="text-white/40 text-xs mt-1">₹{order.total}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Canteens */}
        <div className="mb-8">
          <h2 className="font-display text-2xl text-white mb-4">Order from</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {CANTEENS.map(c => (
              <Link key={c} to={`/menu/${encodeURIComponent(c)}`}
                className="glass rounded-2xl p-4 text-center hover:bg-white/10 transition-all hover:scale-[1.02]">
                <div className="text-3xl mb-2">{CANTEEN_EMOJIS[c]}</div>
                <p className="text-white/70 text-xs font-medium">{c}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Order History */}
        {past.length > 0 && (
          <div>
            <h2 className="font-display text-2xl text-white mb-4">Order History</h2>
            <div className="space-y-2">
              {past.slice(0, 5).map(order => (
                <Link key={order._id} to={`/track/${order._id}`}
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                  <Package className="w-5 h-5 text-white/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm">{order.canteen} · {order.tokenNumber}</p>
                    <p className="text-white/30 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  <span className="text-white/60 text-sm">₹{order.total}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-24 text-white/30">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl mb-4">No orders yet</p>
            <Link to="/menu" className="btn-primary">Browse Menu</Link>
          </div>
        )}
      </div>
    </div>
  );
}
