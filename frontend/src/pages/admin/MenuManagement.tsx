import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { MenuItem } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['Snacks', 'Meals', 'Drinks', 'Desserts', 'Breakfast', 'Fast Food', 'Healthy'];
const EMPTY = { name: '', description: '', price: '', image: '', category: 'Snacks', prepTime: '10', isVeg: true };

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/menu', { params: { canteen: user?.canteen } });
      setItems(data.items);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: MenuItem) => { setEditing(item); setForm({ ...item, price: String(item.price), prepTime: String(item.prepTime) }); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), prepTime: Number(form.prepTime) };
      if (editing) {
        const { data } = await api.put(`/menu/${editing._id}`, payload);
        setItems(prev => prev.map(i => i._id === editing._id ? data.item : i));
        toast.success('Item updated!');
      } else {
        const { data } = await api.post('/menu', payload);
        setItems(prev => [...prev, data.item]);
        toast.success('Item added!');
      }
      setShowModal(false);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggle = async (id: string) => {
    try {
      const { data } = await api.patch(`/menu/${id}/toggle`);
      setItems(prev => prev.map(i => i._id === id ? data.item : i));
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-white/40 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="font-display text-2xl text-white">Menu Management</h1>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="glass rounded-2xl h-56 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <motion.div key={item._id} layout className={`glass rounded-2xl overflow-hidden ${!item.isAvailable ? 'opacity-50' : ''}`}>
                <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-medium text-sm truncate flex-1">{item.name}</h3>
                    <span className="text-brand-400 text-sm font-bold ml-2">₹{item.price}</span>
                  </div>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{item.category}</span>
                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => toggle(item._id)} className={`transition-colors ${item.isAvailable ? 'text-green-400' : 'text-white/30'}`}>
                      {item.isAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openEdit(item)} className="flex-1 glass hover:bg-white/10 text-white/60 hover:text-white text-xs py-1.5 rounded-lg transition-all flex items-center justify-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => deleteItem(item._id)} className="glass hover:bg-red-500/20 text-red-400/60 hover:text-red-400 p-1.5 rounded-lg transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-white">{editing ? 'Edit Item' : 'Add Item'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Name', key: 'name', type: 'text', placeholder: 'e.g. Masala Chai' },
                  { label: 'Description', key: 'description', type: 'text', placeholder: 'Short description' },
                  { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '0' },
                  { label: 'Image URL', key: 'image', type: 'url', placeholder: 'https://...' },
                  { label: 'Prep Time (min)', key: 'prepTime', type: 'number', placeholder: '10' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm text-white/60 mb-1.5">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      className="input-dark w-full" placeholder={f.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}
                    className="input-dark w-full">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isVeg" checked={form.isVeg} onChange={e => setForm((p: any) => ({ ...p, isVeg: e.target.checked }))}
                    className="w-4 h-4 accent-green-500" />
                  <label htmlFor="isVeg" className="text-white/60 text-sm">Vegetarian</label>
                </div>
              </div>
              <button onClick={save} disabled={saving} className="w-full btn-primary mt-6 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : (editing ? 'Update Item' : 'Add Item')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
