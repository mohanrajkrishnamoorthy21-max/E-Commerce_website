import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await getProduct(id);
        setProduct(data.data);
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      addToast('Please login to add items to cart', 'error');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product._id, quantity);
      addToast('Added to cart!');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/" className="text-brand-600 hover:underline mt-4 inline-block">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{product.category}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="card aspect-square">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-brand-600 capitalize mb-2">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.title}</h1>
          <p className="text-3xl font-bold text-brand-600 mt-4">${product.price.toFixed(2)}</p>

          <p className="text-gray-600 dark:text-gray-400 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium text-sm">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600 font-medium text-sm">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                >
                  -
                </button>
                <span className="px-4 py-2.5 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 sm:flex-none"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-gray-500">
              <Link to="/login" className="text-brand-600 hover:underline">Login</Link> to add items to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
