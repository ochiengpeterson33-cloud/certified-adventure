import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Plus, Edit, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  slug: string;
  county: string;
  country: string;
  description: string;
  hero_image: string;
}

export function DestinationsManager() {
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: destinations, isLoading, error, refetch } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('destinations').select('*').order('name');
      if (error) throw error;
      return data as Destination[];
    }
  });

  const handleSave = async () => {
    if (!editingDest) return;
    
    try {
      const destData = {
        name: editingDest.name,
        slug: editingDest.slug || editingDest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        county: editingDest.county,
        country: editingDest.country,
        description: editingDest.description,
        hero_image: editingDest.hero_image,
      };

      if (isCreating) {
        const { error } = await supabase.from('destinations').insert(destData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('destinations').update(destData).eq('id', editingDest.id);
        if (error) throw error;
      }
      
      setEditingDest(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Error saving destination:", error);
      alert("Failed to save changes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
      const { error } = await supabase.from('destinations').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting destination:", error);
      alert("Failed to delete destination");
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingDest({
      id: '',
      name: '',
      slug: '',
      county: '',
      country: 'Kenya',
      description: '',
      hero_image: '',
    });
  };

  if (isLoading) return <div className="p-8">Loading destinations...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading destinations.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations Manager</h1>
          <p className="text-gray-500 mt-1">Manage locations available for tours and trips.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Destination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {destinations?.map((dest) => (
            <div 
              key={dest.id} 
              className={`bg-white rounded-xl border-2 transition-all cursor-pointer overflow-hidden group ${
                editingDest?.id === dest.id ? 'border-[#E67A3A] shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => {
                setIsCreating(false);
                setEditingDest(dest);
              }}
            >
              <div className="h-32 bg-gray-100 relative">
                {dest.hero_image ? (
                  <img src={dest.hero_image} alt={dest.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(dest.id);
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 truncate">{dest.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 truncate">
                  <MapPin size={14} className="text-[#E67A3A] flex-shrink-0" />
                  {dest.county}, {dest.country}
                </div>
              </div>
            </div>
          ))}

          {(!destinations || destinations.length === 0) && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
              <MapPin size={48} className="mb-3 text-gray-300" />
              <p className="font-medium">No destinations found</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {editingDest ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'New Destination' : 'Edit Destination'}</h2>
                <button onClick={() => setEditingDest(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Destination Name</label>
                  <input 
                    type="text"
                    value={editingDest.name}
                    onChange={(e) => setEditingDest({...editingDest, name: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">County/Region</label>
                    <input 
                      type="text"
                      value={editingDest.county}
                      onChange={(e) => setEditingDest({...editingDest, county: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Country</label>
                    <input 
                      type="text"
                      value={editingDest.country}
                      onChange={(e) => setEditingDest({...editingDest, country: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text"
                    value={editingDest.hero_image || ''}
                    onChange={(e) => setEditingDest({...editingDest, hero_image: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use Media Library to upload images and paste URL here.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={editingDest.description || ''}
                    onChange={(e) => setEditingDest({...editingDest, description: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm h-32 resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button 
                    onClick={() => setEditingDest(null)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!editingDest.name}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500 h-64 sticky top-8">
              <MapPin size={48} className="mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">No destination selected</p>
              <p className="text-sm mt-1">Select a destination to edit, or add a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
