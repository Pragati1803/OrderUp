import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import OrderTracking from './pages/OrderTracking';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ChatBot from './components/ChatBot';

const PrivateRoute = ({ children, role }: { children: React.ReactNode; role?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !role.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'student' ? '/dashboard' : '/admin'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/menu/:canteen?" element={<Menu />} />
        <Route path="/cart" element={<PrivateRoute role={['student']}><Cart /></PrivateRoute>} />
        <Route path="/payment/:orderId" element={<PrivateRoute role={['student']}><Payment /></PrivateRoute>} />
        <Route path="/track/:orderId" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute role={['student']}><StudentDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute role={['owner', 'admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/menu" element={<PrivateRoute role={['owner', 'admin']}><MenuManagement /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute role={['owner', 'admin']}><OrderManagement /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {user && <ChatBot />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            }} />
            <AppRoutes />
          </BrowserRouter>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
