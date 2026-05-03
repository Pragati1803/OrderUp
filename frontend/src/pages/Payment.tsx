import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { Order } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

declare global { interface Window { Razorpay: any; } }

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const { clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.order);
    } catch { toast.error('Order not found'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  const handlePayment = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const { data } = await api.post('/payment/create-order', { orderId: order._id });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'OrderUp PSIT',
        description: `Order ${order.tokenNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#f97316' },
        handler: async (response: any) => {
          try {
            await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            toast.success('Payment successful! 🎉');
            navigate(`/track/${order._id}`);
          } catch {
            toast.error('Payment verification failed');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => { toast('Payment cancelled'); setPaying(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment failed');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  );

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="font-display text-3xl text-white">Complete Payment</h1>
          <p className="text-white/40 mt-1 text-sm">Secure payment via Razorpay</p>
        </div>

        {/* Order items */}
        <div className="glass rounded-2xl p-4 mb-6 space-y-3 max-h-48 overflow-y-auto">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-white/70">{item.name} × {item.quantity}</span>
              <span className="text-white font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between text-white/60"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          <div className="flex justify-between text-white/60"><span>Tax (5%)</span><span>₹{order.tax}</span></div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-white font-bold text-lg">Total</span>
            <span className="text-brand-400 font-bold text-2xl">₹{order.total}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>256-bit SSL encrypted · Powered by Razorpay</span>
        </div>

        <button onClick={handlePayment} disabled={paying}
          className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4">
          {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
          {paying ? 'Processing...' : `Pay ₹${order.total}`}
        </button>

        <p className="text-center text-xs text-white/20 mt-4">
          By paying, you agree to our terms. Refunds are handled by the canteen.
        </p>
      </motion.div>
    </div>
  );
}
