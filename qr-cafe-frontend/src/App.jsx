import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-confirm/:orderNumber" element={<OrderConfirmPage />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
