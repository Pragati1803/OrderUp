import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      const u = JSON.parse(localStorage.getItem('orderup_user') || '{}');
      navigate(u.role === 'student' ? '/dashboard' : '/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,transparent_60%)]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md glass rounded-3xl p-8">
        
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl text-white">Order<span className="text-gradient">Up</span></Link>
          <p className="text-white/40 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="input-dark w-full" placeholder="you@psit.ac.in" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="input-dark w-full pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 glass rounded-2xl p-4 text-xs text-white/40 space-y-1">
          <p className="font-medium text-white/60 mb-2">Demo accounts:</p>
          <p>Student: student@psit.ac.in / student123</p>
          <p>Owner: owner.nescafe@orderup.psit / password123</p>
          <p>Admin: admin@orderup.psit / admin123</p>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          No account? <Link to="/register" className="text-brand-500 hover:text-brand-400 transition-colors">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
