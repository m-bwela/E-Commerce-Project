// AdminProducts — manage the product catalog
//
// WHAT THIS PAGE DOES:
//   - Shows all products in a table (image, name, category, price, stock)
//   - "Add Product" button → opens a modal form
//   - Edit button per row  → opens the same modal but pre-filled
//   - Delete button per row → confirms, then deletes
//
// DATA FLOW:
//   On mount: dispatch(fetchAdminProducts) → reads from Redux state.admin.products
//   Create:   createProductAPI(formData)   → re-fetch to refresh table
//   Update:   updateProductAPI(id, fd)     → re-fetch to refresh table
//   Delete:   deleteProductAPI(id)         → re-fetch to refresh table
//
// WHY FORMDATA INSTEAD OF JSON?
//   Because we need to upload an image file.
//   JSON can only hold text. FormData can hold text + binary files together.

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts } from '@/store/adminSlice';
import {
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from '@/api/admin';
import toast from 'react-hot-toast';
import { PlusCircle, Pencil, Trash2, ImageIcon } from 'lucide-react';

// Blank form — used when opening the modal for creating a new product
const EMPTY_FORM = { name: '', description: '', price: '', category: '', stock: '', image: null };

// Image base URL — our backend serves uploaded files from this address
const IMG_BASE = '';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.admin);

  // ── Local state (UI concerns, not shared with Redux) ──────────────────────
  const [isModalOpen, setIsModalOpen]       = useState(false);   // show/hide modal
  const [editingProduct, setEditingProduct] = useState(null);    // null=create, object=edit
  const [formData, setFormData]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting]         = useState(false);   // disables Save button

  // Fetch products when the page first loads
  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // ── OPEN MODAL ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingProduct(null);             // null = we are creating (not editing)
    setFormData(EMPTY_FORM);             // reset to blank form
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);          // store which product we're editing
    setFormData({                        // pre-fill the form with existing values
      name:        product.name        || '',
      description: product.description || '',
      price:       product.price       ?? '',
      category:    product.category    || '',
      stock:       product.stock       ?? '',
      image:       null,               // don't pre-fill image — user picks a new one if they want
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  };

  // ── FORM FIELD CHANGE HANDLER ─────────────────────────────────────────────
  // Called every time the user types in a field or picks a file
  // e.target.name = which field changed (e.g. "price")
  // e.target.value = what they typed (e.g. "5000")
  const handleChange = (e) => {
    if (e.target.type === 'file') {
      // For file inputs, the value is in e.target.files[0]
      setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  // ── SUBMIT (CREATE or UPDATE) ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent browser from refreshing the page on form submit

    // Build FormData — a special object that can hold text + files
    const fd = new FormData();
    fd.append('name',        formData.name);
    fd.append('description', formData.description);
    fd.append('price',       formData.price);
    fd.append('category',    formData.category);
    fd.append('stock',       formData.stock);
    // Only include the image if the user actually picked one
    // If editing and no new image chosen, the backend keeps the existing one
    if (formData.image) {
      fd.append('image', formData.image);
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        // UPDATE existing product
        await updateProductAPI(editingProduct.id, fd);
        toast.success('Product updated!');
      } else {
        // CREATE new product
        await createProductAPI(fd);
        toast.success('Product created!');
      }
      closeModal();
      dispatch(fetchAdminProducts()); // refresh the table with latest data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (product) => {
    // window.confirm() shows a browser pop-up: "Are you sure?"
    // Returns true if they click OK, false if they click Cancel
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      await deleteProductAPI(product.id);
      toast.success(`"${product.name}" deleted`);
      dispatch(fetchAdminProducts()); // refresh table
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">

      {/* Page header + Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ── PRODUCTS TABLE ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Image</th>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Price (KSh)</th>
                <th className="px-5 py-3 text-right font-medium">Stock</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && products.length === 0 ? (
                // Skeleton rows while loading
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-20 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    No products yet. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product thumbnail image */}
                    <td className="px-5 py-3">
                      {product.image ? (
                        <img
                          src={`${IMG_BASE}${product.image}`}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{product.name}</td>
                    <td className="px-5 py-3 text-gray-500">{product.category || '—'}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">
                      {Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">{product.stock}</td>
                    {/* Edit + Delete buttons */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ───────────────────────────────────────── */}
      {/* The modal is a full-screen overlay (backdrop) with the form centred inside */}
      {isModalOpen && (
        // Backdrop: clicking outside the white box closes the modal
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* White modal box */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Nike Air Max"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief product description..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
                />
              </div>

              {/* Price + Stock side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (KSh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Footwear, Electronics..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              {/* Image file picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image {editingProduct && <span className="text-gray-400 font-normal">(leave blank to keep existing)</span>}
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3
                             file:rounded-lg file:border-0 file:bg-zinc-100 file:text-zinc-700
                             file:text-sm file:font-medium hover:file:bg-zinc-200 cursor-pointer"
                />
                {/* Preview current image when editing */}
                {editingProduct?.image && !formData.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={`${IMG_BASE}${editingProduct.image}`}
                      alt="Current"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <span className="text-xs text-gray-400">Current image</span>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
