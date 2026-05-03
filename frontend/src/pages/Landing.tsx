import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Star, Zap, ChevronRight, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CANTEENS, CANTEEN_DESCRIPTIONS, CANTEEN_EMOJIS } from '../utils/api';

export default function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const FADE = 0.5;

    const tick = () => {
      if (!video.duration || isNaN(video.duration)) { rafRef.current = requestAnimationFrame(tick); return; }
      const t = video.currentTime;
      const d = video.duration;
      if (t < FADE) video.style.opacity = String(t / FADE);
      else if (t > d - FADE) video.style.opacity = String((d - t) / FADE);
      else video.style.opacity = '1';
      rafRef.current = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => { video.currentTime = 0; video.play(); }, 100);
    };

    video.addEventListener('ended', onEnded);
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); video.removeEventListener('ended', onEnded); };
  }, []);

  const features = [
    { icon: <Zap className="w-5 h-5" />, title: 'Instant Orders', desc: 'Place orders in seconds, no queues' },
    { icon: <Clock className="w-5 h-5" />, title: 'Live Tracking', desc: 'Real-time ETA & order status' },
    { icon: <ShoppingBag className="w-5 h-5" />, title: 'Token System', desc: 'Unique token for easy pickup' },
    { icon: <Star className="w-5 h-5" />, title: 'AI Assistant', desc: 'Smart food recommendations' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0f]">
      {/* Video Hero */}
      <div className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src="/hero-bg.mp4"
          className="absolute w-full h-full object-cover z-0 transition-opacity duration-100"
          style={{ opacity: 0, top: '300px', inset: 'auto 0 0 0' }}
          muted playsInline loop={false}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0a0a0f]/60 via-transparent to-[#0a0a0f]/60" />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-display font-normal tracking-tight text-white">
              Order<span className="text-gradient">Up</span>
            </span>
            <span className="text-xs text-white/40 mt-1 ml-1">PSIT</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Menu', 'Canteens', 'About'].map(item => (
              <Link key={item} to={item === 'Menu' ? '/menu' : '#'} className="text-sm text-white/60 hover:text-white transition-colors font-sans">{item}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to={user.role === 'student' ? '/dashboard' : '/admin'}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.03]">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors font-sans">Login</Link>
                <Link to="/register" className="flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.03]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6"
          style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '10rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/70 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            7 Canteens · Live Ordering · PSIT Lucknow
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl md:text-8xl max-w-5xl font-normal text-white mb-6"
            style={{ lineHeight: 0.95, letterSpacing: '-2px' }}>
            Hassle-free<br />
            <span className="text-gradient italic">canteen</span>{' '}
            experience
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg max-w-2xl text-white/50 mt-4 leading-relaxed font-sans">
            Skip the queue. Order online from your favourite PSIT canteen, pay seamlessly,
            and pick up using your unique token — all in under a minute.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link to="/menu"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-14 py-5 rounded-full text-base transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-brand-500/30">
              Browse Menu <ChevronRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link to="/register"
                className="flex items-center gap-2 glass text-white font-medium px-10 py-5 rounded-full text-base transition-all duration-200 hover:bg-white/10">
                Create Account
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Canteens Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }} className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">Our Canteens</h2>
          <p className="text-white/40 text-lg">Seven unique flavours, one seamless platform</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CANTEENS.map((canteen, i) => (
            <motion.div key={canteen}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}>
              <Link to={`/menu/${encodeURIComponent(canteen)}`}
                className="group block glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-500/10">
                <div className="text-4xl mb-4">{CANTEEN_EMOJIS[canteen]}</div>
                <h3 className="text-white font-semibold text-lg mb-1">{canteen}</h3>
                <p className="text-white/40 text-sm">{CANTEEN_DESCRIPTIONS[canteen]}</p>
                <div className="flex items-center gap-1 mt-4 text-brand-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Menu <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-8 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-500">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-white/30 text-sm">
        <p className="font-display text-2xl text-white/60 mb-3">OrderUp<sup>®</sup></p>
        <p className="flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> PSIT, Lucknow, Uttar Pradesh</p>
        <p className="mt-2">© 2025 OrderUp. All rights reserved.</p>
      </footer>
    </div>
  );
}
