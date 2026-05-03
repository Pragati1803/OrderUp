import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, Clock, CheckCircle, LogOut, Menu, ListOrdered } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [popular, setPopular] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/analytics');
      setStats(data.stats);
      setPopular(data.popularItems);
      setDaily(data.daily);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const statCards = stats ? [
    { label: "Today's Orders", value: stats.todayOrders, icon: <ShoppingBag />, color: 'text-blue-400' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <Clock />, color: 'text-purple-400' },
    { label: 'Revenue', value: `₹${stats.totalRevenue}`, icon: <TrendingUp />, color: 'text-brand-400' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: <CheckCircle />, color: 'text-green-400' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-display text-2xl text-white">Order<span className="text-gradient">Up</span></span>
            <span className="text-white/30 text-sm ml-3">{user?.canteen || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/orders" className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-colors">
              <ListOrdered className="w-4 h-4" /> Orders
            </Link>
            <Link to="/admin/menu" className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-colors">
              <Menu className="w-4 h-4" /> Menu
            </Link>
            <button onClick={logout} className="text-white/40 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-white mb-8">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-28 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6">
                <div className={`${s.color} mb-3`}>{s.icon}</div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/40 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily chart */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-6">Orders (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily}>
                <XAxis dataKey="_id" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Popular items */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-6">Popular Items</h2>
            <div className="space-y-3">
              {popular.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-white/30 text-sm w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item._id}</p>
                    <div className="h-1.5 bg-white/10 rounded-full mt-1.5">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min((item.count / (popular[0]?.count || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-white/40 text-xs">{item.count} orders</span>
                </div>
              ))}
              {popular.length === 0 && <p className="text-white/30 text-sm">No data yet</p>}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link to="/admin/orders" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <ListOrdered className="w-8 h-8 text-brand-500 mb-3" />
            <h3 className="text-white font-semibold mb-1">Manage Orders</h3>
            <p className="text-white/40 text-sm">Accept, reject & update order status</p>
          </Link>
          <Link to="/admin/menu" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <Menu className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="text-white font-semibold mb-1">Manage Menu</h3>
            <p className="text-white/40 text-sm">Add, edit or remove menu items</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
