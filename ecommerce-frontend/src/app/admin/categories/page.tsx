"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', image: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', image: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSave = async () => {
    if (!addForm.name) {
      toast.error('Name is required');
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Category added');
      setAdding(false);
      setAddForm({ name: '', description: '', image: '' });
      fetchCategories();
    } catch {
      toast.error('Failed to add category');
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setEditForm({ name: cat.name, description: cat.description, image: cat.image });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/categories/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Category updated');
      setEditing(null);
      fetchCategories();
    } catch {
      toast.error('Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-sand p-8">
      <div className="max-w-4xl mx-auto bg-white/80 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Category Management</h1>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold"
            onClick={() => setAdding(true)}
          >Add Category</button>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b">
                  <td className="px-4 py-2 font-semibold">{cat.name}</td>
                  <td className="px-4 py-2">{cat.description}</td>
                  <td className="px-4 py-2">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded" /> : <span className="text-gray-400">No image</span>}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm" onClick={() => openEdit(cat)}>Edit</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm disabled:opacity-50" disabled={deleting === cat._id} onClick={() => handleDelete(cat._id)}>{deleting === cat._id ? 'Deleting...' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Add Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setAdding(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <div className="space-y-4">
              <input type="text" name="name" value={addForm.name} onChange={handleAddChange} className="w-full border rounded px-3 py-2" placeholder="Category Name*" />
              <textarea name="description" value={addForm.description} onChange={handleAddChange} className="w-full border rounded px-3 py-2" placeholder="Description" rows={2} />
              <input type="text" name="image" value={addForm.image} onChange={handleAddChange} className="w-full border rounded px-3 py-2" placeholder="Image URL (optional)" />
            </div>
            <button className="mt-6 w-full bg-yellow-500 text-white font-semibold rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors" onClick={handleAddSave} disabled={addLoading}>{addLoading ? 'Saving...' : 'Add Category'}</button>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setEditing(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <div className="space-y-4">
              <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-3 py-2" placeholder="Category Name*" />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} className="w-full border rounded px-3 py-2" placeholder="Description" rows={2} />
              <input type="text" name="image" value={editForm.image} onChange={handleEditChange} className="w-full border rounded px-3 py-2" placeholder="Image URL (optional)" />
            </div>
            <button className="mt-6 w-full bg-yellow-500 text-white font-semibold rounded-lg px-4 py-2 hover:bg-yellow-600 transition-colors" onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}
    </div>
  );
} 