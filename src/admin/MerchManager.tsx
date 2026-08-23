import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Upload, Trash2, Plus, Save, X, ShoppingCart } from 'lucide-react';

interface MerchItem {
  id: string;
  name: string;
  price: string;
  image_url: string;
  is_active: boolean;
  display_order?: number;
}

export function MerchManager() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: initialItems, isLoading, error, refetch } = useQuery({
    queryKey: ['merch'],
    queryFn: async () => {
      const { data, error } = await supabase.from('merch').select('*').order('display_order');
      if (error) throw error;
      return data as MerchItem[];
    }
  });

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    const channel = supabase
      .channel('merch_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merch' }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!editingItem || acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('merch-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('merch-images')
        .getPublicUrl(fileName);

      setEditingItem({ ...editingItem, image_url: publicUrl });
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
          .from('merch')
          .insert([{
            name: editingItem.name,
            price: editingItem.price,
            image_url: editingItem.image_url,
            is_active: editingItem.is_active,
            display_order: items.length + 1
          }]);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('merch')
          .update({
            name: editingItem.name,
            price: editingItem.price,
            image_url: editingItem.image_url,
            is_active: editingItem.is_active
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

  const handleCreateNew = () => {
    setEditingItem({
      id: '',
      name: 'New Merch Item',
      price: '$0.00',
      image_url: '',
      is_active: true
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this merch item?")) return;

    try {
      const { error } = await supabase.from('merch').delete().eq('id', id);
      if (error) throw error;
      
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
      refetch();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  if (isLoading) return <div className="p-8">Loading merch items...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading merch. Please verify Supabase setup.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merch Manager</h1>
          <p className="text-gray-500 mt-1">Manage merchandise products in the store.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Merch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Items List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-4 rounded-xl border-2 transition-colors ${editingItem?.id === item.id && !isCreating ? 'border-[#E67A3A]' : 'border-gray-200'} flex gap-4 cursor-pointer relative group`}
              onClick={() => {
                setEditingItem(item);
                setIsCreating(false);
              }}
            >
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#E67A3A] mt-1">{item.price}</p>
              </div>

              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No merch found. Click "Add Merch" to create one.
            </div>
          )}
        </div>

        {/* Edit Panel */}
        {editingItem && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'Create New Merch' : 'Edit Merch'}</h2>
              <button 
                onClick={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image</label>
                <div 
                  {...getRootProps()} 
                  className={`relative aspect-square md:aspect-video rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
                    isDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
                  }`}
                >
                  <input {...getInputProps()} />
                  {editingItem.image_url ? (
                    <>
                      <img src={editingItem.image_url} alt="Merch" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium flex items-center gap-2">
                          <Upload size={18} /> Replace Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Upload size={24} className="mb-2 text-gray-400" />
                      <span className="text-sm font-medium">Click or drag image to upload</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-[#E67A3A] border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price (e.g. $25.00)</label>
                <input 
                  type="text"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={editingItem.is_active}
                  onChange={(e) => setEditingItem({...editingItem, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#E67A3A] rounded focus:ring-[#E67A3A]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Set as active</label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} /> {isCreating ? 'Create Merch' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
