"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { categoriesAPI } from "@/components/services/api";
import Image from "next/image";

import DragAndDropImage from '@/app/components/ui/DragAndDropImage';

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { auth } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', image: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', image: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);


  // Check if user is admin
  useEffect(() => {
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/login');
      return;
    }
  }, [auth, router]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (auth.isAuthenticated && auth.user?.role === 'admin') {
      fetchCategories(); 
    }
  }, [auth]);

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
      await categoriesAPI.create({
        name: addForm.name,
        description: addForm.description
      });
      
      toast.success('Category added successfully');
      setAdding(false);
      setAddForm({ name: '', description: '', image: '' });
      fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add category';
      toast.error(errorMessage);
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
      await categoriesAPI.update(editing._id, {
        name: editForm.name,
        description: editForm.description
      });
      
      toast.success('Category updated successfully');
      setEditing(null);
      fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setDeleting(id);
    try {
      await categoriesAPI.delete(id);
      
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };



  // Show loading if not authenticated or not admin
  if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-4xl mx-auto bg-neutral-900 rounded-lg shadow-lg p-8 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Category Management</h1>
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 font-semibold"
            onClick={() => setAdding(true)}
          >Add Category</button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">Loading categories...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-800 text-white">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Image</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No categories found. Add your first category!
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="border-b border-neutral-800">
                    <td className="px-4 py-2 font-semibold">{cat.name}</td>
                    <td className="px-4 py-2">{cat.description}</td>
                    <td className="px-4 py-2">
                      {cat.image ? <Image src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded" width={48} height={48} /> : <span className="text-gray-400">No image</span>}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm" onClick={() => openEdit(cat)}>Edit</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm disabled:opacity-50" disabled={deleting === cat._id} onClick={() => handleDelete(cat._id)}>{deleting === cat._id ? 'Deleting...' : 'Delete'}</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Add Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-md relative border border-neutral-800">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-2xl" onClick={() => setAdding(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-white">Add Category</h2>
            <div className="space-y-4">
              <input type="text" name="name" value={addForm.name} onChange={handleAddChange} className="w-full border border-neutral-700 bg-neutral-800 text-white rounded px-3 py-2" placeholder="Category Name*" />
              <textarea name="description" value={addForm.description} onChange={handleAddChange} className="w-full border border-neutral-700 bg-neutral-800 text-white rounded px-3 py-2" placeholder="Description" rows={2} />
              <DragAndDropImage
                value={imageFile}
                previewUrl={addForm.image}
                onChange={async (file) => {
                  if (!file) {
                    setImageFile(null);
                    setAddForm(f => ({ ...f, image: '' }));
                    return;
                  }
                  setImageUploading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                      credentials: 'include',
                    });
                    const data = await res.json();
                    if (data.success && data.data.url) {
                      setAddForm(f => ({ ...f, image: data.data.url }));
                      setImageFile(file);
                      toast.success('Image uploaded!');
                    } else {
                      toast.error('Image upload failed');
                    }
                  } catch {
                    toast.error('Image upload failed');
                  } finally {
                    setImageUploading(false);
                  }
                }}
                label="Category Image (optional)"
                disabled={imageUploading}
              />
            </div>
            <button className="mt-6 w-full bg-primary text-white font-semibold rounded-lg px-4 py-2 hover:bg-primary/80 transition-colors" onClick={handleAddSave} disabled={addLoading}>{addLoading ? 'Saving...' : 'Add Category'}</button>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-md relative border border-neutral-800">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-2xl" onClick={() => setEditing(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-white">Edit Category</h2>
            <div className="space-y-4">
              <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full border border-neutral-700 bg-neutral-800 text-white rounded px-3 py-2" placeholder="Category Name*" />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} className="w-full border border-neutral-700 bg-neutral-800 text-white rounded px-3 py-2" placeholder="Description" rows={2} />
              <DragAndDropImage
                value={imageFile}
                previewUrl={editForm.image}
                onChange={async (file) => {
                  if (!file) {
                    setImageFile(null);
                    setEditForm(f => ({ ...f, image: '' }));
                    return;
                  }
                  setImageUploading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                      credentials: 'include',
                    });
                    const data = await res.json();
                    if (data.success && data.data.url) {
                      setEditForm(f => ({ ...f, image: data.data.url }));
                      setImageFile(file);
                      toast.success('Image uploaded!');
                    } else {
                      toast.error('Image upload failed');
                    }
                  } catch {
                    toast.error('Image upload failed');
                  } finally {
                    setImageUploading(false);
                  }
                }}
                label="Category Image (optional)"
                disabled={imageUploading}
              />
            </div>
            <button className="mt-6 w-full bg-primary text-white font-semibold rounded-lg px-4 py-2 hover:bg-primary/80 transition-colors" onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Saving...' : 'Update Category'}</button>
          </div>
        </div>
      )}
    </div>
  );
} 