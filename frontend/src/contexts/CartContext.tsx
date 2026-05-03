import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../utils/api';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  canteen: string | null;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  tax: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [canteen, setCanteen] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('orderup_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed.items || []);
      setCanteen(parsed.canteen || null);
    }
  }, []);

  const saveCart = (newItems: CartItem[], newCanteen: string | null) => {
    localStorage.setItem('orderup_cart', JSON.stringify({ items: newItems, canteen: newCanteen }));
  };

  const addItem = (item: MenuItem) => {
    if (canteen && canteen !== item.canteen) {
      if (!confirm(`Your cart has items from ${canteen}. Clear cart and add from ${item.canteen}?`)) return;
      setItems([]);
      setCanteen(null);
    }

    setItems(prev => {
      const exists = prev.find(i => i._id === item._id);
      let updated: CartItem[];
      if (exists) {
        updated = prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      const nc = item.canteen;
      setCanteen(nc);
      saveCart(updated, nc);
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i._id !== id);
      if (updated.length === 0) setCanteen(null);
      saveCart(updated, updated.length ? canteen : null);
      return updated;
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { removeItem(id); return; }
    setItems(prev => {
      const updated = prev.map(i => i._id === id ? { ...i, quantity: qty } : i);
      saveCart(updated, canteen);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCanteen(null);
    localStorage.removeItem('orderup_cart');
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, canteen, addItem, removeItem, updateQty, clearCart, total, subtotal, tax, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
