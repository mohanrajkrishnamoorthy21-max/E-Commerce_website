import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to add items to cart', 'error');
      return;
    }
    try {
      await addToCart(product._id);
      addToast('Added to cart!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
        <span className="absolute top-2 right-2 bg-brand-600 text-white text-xs font-medium px-2 py-1 rounded capitalize">
          {product.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-brand-600">${product.price.toFixed(2)}</span>
          {isAuthenticated && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="text-sm bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 dark:text-brand-300 font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
