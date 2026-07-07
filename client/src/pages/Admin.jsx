import { useState, useEffect } from 'react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyProduct = {
  title: '',
  description: '',
  price: '',
  image: '',
  category: '',
  stock: '',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const Admin = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        getProducts(),
        getAllOrders(),
        getCategories(),
      ]);
      setProducts(productsRes.data.data);
      setOrders(ordersRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateProduct(editingId, payload);
        addToast('Product updated!');
      } else {
        await createProduct(payload);
        addToast('Product created!');
      }
      resetForm();
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      addToast('Product deleted');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      addToast('Order status updated');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage products and orders</p>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab('products')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            tab === 'products' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            tab === 'orders' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Orders ({orders.length})
        </button>
      </div>

      {tab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Product Management</h2>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="btn-primary"
            >
              + Add Product
            </button>
          </div>

          {showForm && (
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? 'Edit Product' : 'New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" value={form.title} onChange={handleFormChange} placeholder="Title" className="input-field" required />
                <input name="category" value={form.category} onChange={handleFormChange} placeholder="Category" className="input-field" required list="categories" />
                <datalist id="categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
                <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleFormChange} placeholder="Price" className="input-field" required />
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} placeholder="Stock" className="input-field" required />
                <input name="image" value={form.image} onChange={handleFormChange} placeholder="Image URL" className="input-field md:col-span-2" required />
                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="input-field md:col-span-2" rows={3} required />
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full card">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-sm font-semibold">Product</th>
                  <th className="text-left p-4 text-sm font-semibold">Category</th>
                  <th className="text-left p-4 text-sm font-semibold">Price</th>
                  <th className="text-left p-4 text-sm font-semibold">Stock</th>
                  <th className="text-right p-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium text-sm line-clamp-1">{product.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm capitalize">{product.category}</td>
                    <td className="p-4 text-sm">${product.price.toFixed(2)}</td>
                    <td className="p-4 text-sm">{product.stock}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(product)} className="text-brand-600 hover:underline text-sm mr-3">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Order Management</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-medium">#{String(order._id).padStart(8, '0')}</p>
                    <p className="text-sm text-gray-500">
                      {order.user?.name} ({order.user?.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-600">${order.totalPrice.toFixed(2)}</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer capitalize ${statusColors[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />
                      <span>{item.title}</span>
                      <span className="text-gray-500">×{item.quantity}</span>
                      <span className="ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
