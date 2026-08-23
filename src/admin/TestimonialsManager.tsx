import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus, Trash2, X, Save, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  content: string;
  rating: number;
  avatar_url: string;
  is_featured: boolean;
}

export function TestimonialsManager() {
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: items, isLoading, error, refetch } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    }
  });

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      const itemData = {
        client_name: editingItem.client_name,
        client_role: editingItem.client_role,
        content: editingItem.content,
        rating: editingItem.rating,
        avatar_url: editingItem.avatar_url,
        is_featured: editingItem.is_featured,
      };

      if (isCreating) {
        const { error } = await supabase.from('testimonials').insert(itemData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').update(itemData).eq('id', editingItem.id);
        if (error) throw error;
      }
      
      setEditingItem(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save changes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial");
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingItem({
      id: '',
      client_name: '',
      client_role: 'Traveler',
      content: '',
      rating: 5,
      avatar_url: '',
      is_featured: true,
    });
  };

  if (isLoading) return <div className="p-8">Loading testimonials...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading testimonials.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 mt-1">Manage client reviews and testimonials.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {items?.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-5 rounded-xl border-2 transition-all cursor-pointer ${
                editingItem?.id === item.id ? 'border-[#E67A3A]' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setIsCreating(false);
                setEditingItem(item);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {item.avatar_url ? (
                    <img src={item.avatar_url} alt={item.client_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {item.client_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{item.client_name}</h3>
                    <p className="text-xs text-gray-500">{item.client_role}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < (item.rating || 5) ? "fill-current" : "text-gray-300"} />
                ))}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3 italic">"{item.content}"</p>
              
              {item.is_featured && (
                <div className="mt-3">
                  <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-green-100 text-green-800">
                    Featured
                  </span>
                </div>
              )}
            </div>
          ))}

          {(!items || items.length === 0) && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
              <MessageSquare size={48} className="mb-3 text-gray-300" />
              <p className="font-medium">No testimonials found</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {editingItem ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'New Testimonial' : 'Edit Testimonial'}</h2>
                <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Client Name</label>
                  <input 
                    type="text"
                    value={editingItem.client_name}
                    onChange={(e) => setEditingItem({...editingItem, client_name: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Role / Location</label>
                  <input 
                    type="text"
                    value={editingItem.client_role || ''}
                    onChange={(e) => setEditingItem({...editingItem, client_role: e.target.value})}
                    placeholder="e.g., Solo Traveler"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rating (1-5)</label>
                  <input 
                    type="number"
                    min="1"
                    max="5"
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({...editingItem, rating: parseInt(e.target.value) || 5})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Avatar URL</label>
                  <input 
                    type="text"
                    value={editingItem.avatar_url || ''}
                    onChange={(e) => setEditingItem({...editingItem, avatar_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Review Content</label>
                  <textarea 
                    value={editingItem.content || ''}
                    onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm h-32 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    checked={editingItem.is_featured}
                    onChange={(e) => setEditingItem({...editingItem, is_featured: e.target.checked})}
                    className="w-4 h-4 text-[#E67A3A] rounded border-gray-300 focus:ring-[#E67A3A]"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Display on homepage</label>
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
                    disabled={!editingItem.client_name || !editingItem.content}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500 h-64 sticky top-8">
              <MessageSquare size={48} className="mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">No testimonial selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
