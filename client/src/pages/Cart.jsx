import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (productId, newQty, maxStock) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {
      addToast('Insufficient stock', 'error');
      return;
    }
    try {
      setUpdatingId(productId);
      await updateQuantity(productId, newQty);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      addToast('Item removed from cart');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCheckout = async () => {
    try {
      setOrdering(true);
      await createOrder();
      await refreshCart();
      addToast('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Add some products to get started!</p>
        <Link to="/" className="btn-primary inline-block mt-6">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="card flex gap-4 p-4">
              <Link to={`/product/${item.product._id}`} className="shrink-0">
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.product._id}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 line-clamp-1"
                >
                  {item.product.title}
                </Link>
                <p className="text-brand-600 font-bold mt-1">${item.product.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1, item.product.stock)}
                      disabled={updatingId === item.product._id}
                      className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1, item.product.stock)}
                      disabled={updatingId === item.product._id}
                      className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">${item.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Items ({cart.itemCount})</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-600">${cart.total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={ordering}
            className="btn-primary w-full mt-6"
          >
            {ordering ? 'Placing Order...' : 'Place Order'}
          </button>
          <Link to="/" className="block text-center text-sm text-brand-600 hover:underline mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
