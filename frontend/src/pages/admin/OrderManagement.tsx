import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChefHat, Bell, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { Order, STATUS_LABELS } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const NEXT_STATUS: Record<string, string> = {
  pending: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed'
};
const ACTION_LABELS: Record<string, string> = {
  pending: 'Accept', accepted: 'Start Preparing', preparing: 'Mark Ready', ready: 'Complete'
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (!socket || !user?.canteen) return;
    socket.emit('joinCanteen', user.canteen);
    socket.on('newOrder', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`New order: ${order.tokenNumber}!`, { icon: '🔔' });
    });
    socket.on('orderUpdate', (order: Order) => {
      setOrders(prev => prev.map(o => o._id === order._id ? order : o));
    });
    return () => { socket.off('newOrder'); socket.off('orderUpdate'); };
  }, [socket, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/canteen');
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order ${STATUS_LABELS[status]}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const reject = async (orderId: string) => {
    if (!confirm('Reject this order?')) return;
    await updateStatus(orderId, 'rejected');
  };

  const activeOrders = orders.filter(o => !['completed', 'rejected', 'cancelled'].includes(o.status));
  const doneOrders = orders.filter(o => ['completed', 'rejected'].includes(o.status)).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="font-display text-2xl text-white">Live Orders</h1>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <button onClick={fetchOrders} className="glass p-2 rounded-xl text-white/40 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>
        ) : (
          <>
            {activeOrders.length === 0 && (
              <div className="text-center py-24 text-white/30">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl">No active orders</p>
                <p className="text-sm mt-2">New orders will appear here in real-time</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {activeOrders.map(order => (
                <motion.div key={order._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-3xl text-brand-400 font-bold">{order.tokenNumber}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border status-${order.status}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-white/70">{item.name}</span>
                        <span className="text-white/40">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {(order.user as any)?.name && (
                    <p className="text-white/30 text-xs mb-3">👤 {(order.user as any).name}</p>
                  )}

                  {order.specialInstructions && (
                    <p className="text-yellow-400/60 text-xs mb-3 italic">📝 {order.specialInstructions}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-brand-400 font-semibold">₹{order.total}</span>
                    <span className="text-white/30 text-xs">ETA: {order.estimatedTime}min</span>
                  </div>

                  <div className="flex gap-2">
                    {NEXT_STATUS[order.status] && (
                      <button onClick={() => updateStatus(order._id, NEXT_STATUS[order.status])}
                        disabled={updating === order._id}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2.5 rounded-xl transition-all">
                        {updating === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        {ACTION_LABELS[order.status]}
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button onClick={() => reject(order._id)}
                        className="flex items-center justify-center glass hover:bg-red-500/20 text-red-400 px-3 py-2.5 rounded-xl transition-all">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {doneOrders.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-white/50 mb-4">Completed Today</h2>
                <div className="space-y-2">
                  {doneOrders.map(order => (
                    <div key={order._id} className="glass rounded-xl p-4 flex items-center gap-4 opacity-60">
                      <span className="text-white/60 font-medium">{order.tokenNumber}</span>
                      <span className="text-white/40 text-sm flex-1">{order.items.map(i => i.name).join(', ')}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                      <span className="text-white/40 text-sm">₹{order.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
