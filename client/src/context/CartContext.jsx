import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as addApi, removeFromCart as removeApi, updateCartItem as updateApi, clearCart as clearApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0, itemCount: 0 });
      return;
    }

    try {
      setLoading(true);
      const { data } = await getCart();
      setCart(data.data);
    } catch {
      setCart({ items: [], total: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await addApi(productId, quantity);
    setCart(data.data);
    return data.data;
  };

  const removeFromCart = async (productId, quantity) => {
    const { data } = await removeApi(productId, quantity);
    setCart(data.data);
    return data.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await updateApi(productId, quantity);
    setCart(data.data);
    return data.data;
  };

  const clearCart = async () => {
    const { data } = await clearApi();
    setCart(data.data);
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart: fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
