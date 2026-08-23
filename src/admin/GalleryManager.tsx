import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Image as ImageIcon, Upload, Trash2, Plus, Save, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  display_order: number;
}

export function GalleryManager() {
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: items, isLoading, error, refetch } = useQuery({
    queryKey: ['gallery_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery').select('*').order('display_order');
      if (error) throw error;
      return data as GalleryItem[];
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      if (editingItem) {
        setEditingItem({ ...editingItem, image_url: publicUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [editingItem]);

  const dropzoneOptions: any = { onDrop, accept: {'image/*': []}, maxFiles: 1 };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleSave = async () => {
    if (!editingItem) return;
    
    try {
      if (isCreating) {
        const { error } = await supabase
          .from('gallery')
          .insert({
            title: editingItem.title,
            image_url: editingItem.image_url,
            display_order: editingItem.display_order
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gallery')
          .update({
            title: editingItem.title,
            image_url: editingItem.image_url,
            display_order: editingItem.display_order
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      }
      
      setEditingItem(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save changes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingItem({
      id: '',
      title: 'New Image',
      image_url: '',
      display_order: (items?.length || 0) + 1
    });
  };

  if (isLoading) return <div className="p-8">Loading gallery...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading gallery. Please verify Supabase setup.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Manager</h1>
          <p className="text-gray-500 mt-1">Manage images displayed in the public gallery.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          <span>Add New Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items?.map((item) => (
              <div 
                key={item.id} 
                className={`group relative aspect-square bg-white rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                  editingItem?.id === item.id ? 'border-[#E67A3A] ring-2 ring-[#E67A3A]/20' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(item);
                }}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs font-medium px-2 text-center">No Image</span>
                  </div>
                )}
                
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm font-medium truncate">{item.title || 'Untitled'}</p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {(!items || items.length === 0) && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                <ImageIcon size={48} className="mb-3 text-gray-300" />
                <p className="font-medium">No images in gallery</p>
                <p className="text-sm mt-1">Click "Add New Image" to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="lg:col-span-1">
          {editingItem ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'New Image' : 'Edit Image'}</h2>
                <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image File</label>
                  <div 
                    {...getRootProps()} 
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
                      isDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {editingItem.image_url ? (
                      <>
                        <img src={editingItem.image_url} alt="Gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <Upload size={16} /> Replace
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
                        <Upload size={32} className="mb-3 text-gray-400 group-hover:text-[#E67A3A] transition-colors" />
                        <span className="text-sm font-medium text-gray-700">Click or drag image here</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin w-8 h-8 border-4 border-[#E67A3A] border-t-transparent rounded-full mb-2"></div>
                          <span className="text-sm font-medium text-gray-700">Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title / Caption</label>
                  <input 
                    type="text"
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    placeholder="E.g., Sunset at Maasai Mara"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm transition-shadow"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Display Order</label>
                  <input 
                    type="number"
                    value={editingItem.display_order}
                    onChange={(e) => setEditingItem({...editingItem, display_order: parseInt(e.target.value) || 0})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm transition-shadow"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!editingItem.image_url || isUploading}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save size={16} /> {isCreating ? 'Create' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500 h-64 sticky top-8">
              <ImageIcon size={48} className="mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">No item selected</p>
              <p className="text-sm mt-1">Click on an image in the grid to edit it, or click "Add New Image" to upload a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
