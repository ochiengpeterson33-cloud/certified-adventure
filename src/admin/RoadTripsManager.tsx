import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Map, Plus, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';

interface RoadTrip {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  featured_image: string;
  is_featured: boolean;
}

export function RoadTripsManager() {
  const [editingItem, setEditingItem] = useState<RoadTrip | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: items, isLoading, error, refetch } = useQuery({
    queryKey: ['road_trips'],
    queryFn: async () => {
      const { data, error } = await supabase.from('road_trips').select('*').order('title');
      if (error) throw error;
      return data as RoadTrip[];
    }
  });

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      const itemData = {
        title: editingItem.title,
        slug: editingItem.slug || editingItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: editingItem.description,
        price: editingItem.price,
        duration_days: editingItem.duration_days,
        featured_image: editingItem.featured_image,
        is_featured: editingItem.is_featured,
      };

      if (isCreating) {
        const { error } = await supabase.from('road_trips').insert(itemData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('road_trips').update(itemData).eq('id', editingItem.id);
        if (error) throw error;
      }
      
      setEditingItem(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Error saving road trip:", error);
      alert("Failed to save changes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this road trip?')) return;
    try {
      const { error } = await supabase.from('road_trips').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting road trip:", error);
      alert("Failed to delete road trip");
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingItem({
      id: '',
      title: '',
      slug: '',
      description: '',
      price: 0,
      duration_days: 1,
      featured_image: '',
      is_featured: false,
    });
  };

  if (isLoading) return <div className="p-8">Loading road trips...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading road trips.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Road Trips</h1>
          <p className="text-gray-500 mt-1">Manage road trip packages.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Road Trip</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items?.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row gap-4 cursor-pointer ${
                editingItem?.id === item.id ? 'border-[#E67A3A]' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setIsCreating(false);
                setEditingItem(item);
              }}
            >
              <div className="w-full sm:w-40 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.featured_image ? (
                  <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{item.title}</h3>
                  {item.is_featured && (
                    <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-full flex-shrink-0 bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </div>
                <div className="font-medium text-[#E67A3A] mt-1">${item.price} • {item.duration_days} Days</div>
                <p className="text-sm text-gray-500 line-clamp-2 mt-2">{item.description}</p>
              </div>
              <div className="sm:border-l sm:border-gray-100 sm:pl-4 flex sm:flex-col justify-end sm:justify-start gap-2 pt-4 sm:pt-0 border-t border-gray-100 sm:border-t-0 mt-4 sm:mt-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {(!items || items.length === 0) && (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
              <Map size={48} className="mb-3 text-gray-300" />
              <p className="font-medium">No road trips found</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {editingItem ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'New Road Trip' : 'Edit Road Trip'}</h2>
                <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input 
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                    <input 
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Days)</label>
                    <input 
                      type="number"
                      value={editingItem.duration_days}
                      onChange={(e) => setEditingItem({...editingItem, duration_days: parseInt(e.target.value) || 1})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Featured Image URL</label>
                  <input 
                    type="text"
                    value={editingItem.featured_image || ''}
                    onChange={(e) => setEditingItem({...editingItem, featured_image: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
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
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Feature on homepage</label>
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
                    disabled={!editingItem.title}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500 h-64 sticky top-8">
              <Map size={48} className="mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">No road trip selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
