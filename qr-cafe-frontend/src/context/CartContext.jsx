import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('qr_cafe_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumber] = useState(() => {
    return localStorage.getItem('qr_cafe_table') || null;
  });

  useEffect(() => {
    try {
      localStorage.setItem('qr_cafe_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('qr_cafe_table', tableNumber);
    }
  }, [tableNumber]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === item.id);
      if (existing) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('qr_cafe_cart');
    } catch (e) {
      console.error(e);
    }
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        tableNumber,
        setTableNumber,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalAmount,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
