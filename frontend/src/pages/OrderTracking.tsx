import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Loader2, Package, ChefHat, Bell, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { Order, STATUS_LABELS } from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  accepted: <CheckCircle className="w-5 h-5" />,
  preparing: <ChefHat className="w-5 h-5" />,
  ready: <Bell className="w-5 h-5" />,
  completed: <Package className="w-5 h-5" />,
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;
    socket.emit('joinOrder', orderId);
    socket.on('orderStatusUpdate', (data: any) => {
      if (data.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, status: data.status } : null);
        toast.success(`Order ${STATUS_LABELS[data.status] || data.status}`, { icon: '📦' });
      }
    });
    return () => { socket.emit('leaveOrder', orderId); socket.off('orderStatusUpdate'); };
  }, [socket, orderId]);

  // ETA countdown
  useEffect(() => {
    if (!order) return;
    setEta(order.estimatedTime * 60);
    const interval = setInterval(() => {
      setEta(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.estimatedTime]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.order);
    } catch { toast.error('Order not found'); }
    finally { setLoading(false); }
  };

  const formatETA = (secs: number) => {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white/40 gap-4">
      <p className="text-xl">Order not found</p>
      <Link to="/dashboard" className="btn-primary">Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Token display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8">
          <div className="glass-strong rounded-3xl p-8 inline-block min-w-64">
            <p className="text-white/40 text-sm mb-2 uppercase tracking-widest">Your Token</p>
            <p className="font-display text-7xl font-bold text-brand-400">{order.tokenNumber}</p>
            <p className="text-white/40 text-sm mt-2">{order.canteen}</p>
          </div>
        </motion.div>

        {/* Status indicator */}
        <div className={`glass rounded-2xl p-6 mb-6 text-center status-${order.status} border`}>
          <p className="text-lg font-semibold">{STATUS_LABELS[order.status] || order.status}</p>
          {order.status === 'ready' && (
            <p className="text-sm mt-1 opacity-70">Show this token at the counter to collect your order!</p>
          )}
        </div>

        {/* ETA */}
        {!['completed', 'rejected', 'cancelled'].includes(order.status) && (
          <div className="glass rounded-2xl p-6 mb-6 text-center">
            <p className="text-white/40 text-sm mb-1">Estimated Time</p>
            <p className="text-4xl font-bold text-white font-display">{formatETA(eta)}</p>
            <p className="text-white/30 text-xs mt-1">Queue position: #{order.queuePosition}</p>
          </div>
        )}

        {/* Progress steps */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-white/60 text-sm mb-6 uppercase tracking-wider">Order Progress</h3>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIndex;
              const active = i === stepIndex;
              return (
                <div key={step} className={`flex items-center gap-4 transition-all ${done ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    active ? 'bg-brand-500 shadow-lg shadow-brand-500/40 animate-pulse-slow' :
                    done ? 'bg-green-500' : 'bg-white/10'
                  }`}>
                    {STATUS_ICONS[step]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{STATUS_LABELS[step]}</p>
                    {order.statusHistory?.find(h => h.status === step) && (
                      <p className="text-white/30 text-xs">
                        {new Date(order.statusHistory.find(h => h.status === step)!.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {active && <span className="ml-auto text-brand-400 text-xs animate-pulse">● Live</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white/60 text-sm mb-4 uppercase tracking-wider">Items Ordered</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/70">{item.name} × {item.quantity}</span>
                <span className="text-white">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between text-brand-400 font-semibold">
              <span>Total Paid</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
