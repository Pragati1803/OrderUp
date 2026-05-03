import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { CANTEENS } from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', canteen: '', phone: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! 🎉');
      navigate(form.role === 'student' ? '/dashboard' : '/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08)_0%,transparent_60%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md glass rounded-3xl p-8">

        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl text-white">Order<span className="text-gradient">Up</span></Link>
          <p className="text-white/40 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className="input-dark w-full" placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
              className="input-dark w-full" placeholder="you@psit.ac.in" />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              className="input-dark w-full" placeholder="Optional" />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required minLength={6}
                className="input-dark w-full pr-12" placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['student', 'owner'].map(r => (
                <button key={r} type="button" onClick={() => set('role', r)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${form.role === r ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                  {r === 'student' ? '🎓 Student' : '🏪 Canteen Owner'}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'owner' && (
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Select Canteen</label>
              <select value={form.canteen} onChange={e => set('canteen', e.target.value)} required
                className="input-dark w-full">
                <option value="">Choose your canteen...</option>
                {CANTEENS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Have an account? <Link to="/login" className="text-brand-500 hover:text-brand-400 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
