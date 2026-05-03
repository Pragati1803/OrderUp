import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, ShoppingCart, ArrowLeft, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { MenuItem as IMenuItem, CANTEENS, CANTEEN_EMOJIS } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['All', 'Snacks', 'Meals', 'Drinks', 'Desserts', 'Breakfast', 'Fast Food', 'Healthy'];

export default function Menu() {
  const { canteen: paramCanteen } = useParams();
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCanteen, setSelectedCanteen] = useState(paramCanteen || CANTEENS[0]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { addItem, removeItem, items: cartItems, itemCount, updateQty } = useCart();
  const { user } = useAuth();

  const getQty = (id: string) => cartItems.find(i => i._id === id)?.quantity || 0;

  useEffect(() => {
    fetchMenu();
  }, [selectedCanteen]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/menu', { params: { canteen: selectedCanteen } });
      setItems(data.items);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  const filtered = items.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat && i.isAvailable);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, IMenuItem[]>);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-display text-xl text-white">OrderUp</span>
          </Link>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-dark w-full pl-9 py-2 text-sm" placeholder="Search food..." />
          </div>

          <Link to="/cart" className="relative flex items-center gap-2 btn-primary py-2.5">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Canteen tabs */}
        <div className="max-w-7xl mx-auto px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {CANTEENS.map(c => (
            <button key={c} onClick={() => setSelectedCanteen(c)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCanteen === c ? 'bg-brand-500 text-white' : 'glass text-white/50 hover:text-white hover:bg-white/10'
              }`}>
              {CANTEEN_EMOJIS[c]} {c}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="max-w-7xl mx-auto px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                category === cat ? 'bg-white/20 text-white border border-white/30' : 'text-white/40 hover:text-white border border-white/0 hover:border-white/10'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="mb-12">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-3">
                {cat}
                <span className="text-sm font-sans text-white/30">({catItems.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {catItems.map(item => {
                  const qty = getQty(item._id);
                  return (
                    <motion.div key={item._id} layout
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-300">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-full text-xs text-white/70">
                          ⏱ {item.prepTime}m
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-sm mb-1 truncate">{item.name}</h3>
                        <p className="text-white/40 text-xs mb-3 line-clamp-1">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-brand-400 font-bold">₹{item.price}</span>
                          {!user || user.role !== 'student' ? (
                            <span className="text-white/20 text-xs">Login to order</span>
                          ) : qty === 0 ? (
                            <button onClick={() => { addItem(item); toast.success('Added to cart!', { icon: '🛒' }); }}
                              className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-3 py-2 rounded-xl transition-all hover:scale-105">
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(item._id, qty - 1)}
                                className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-white text-sm font-medium w-4 text-center">{qty}</span>
                              <button onClick={() => addItem(item)}
                                className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center text-white hover:bg-brand-600 transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {!loading && Object.keys(grouped).length === 0 && (
          <div className="text-center py-24 text-white/30">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-xl">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
