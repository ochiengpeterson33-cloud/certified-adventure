import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Image as ImageIcon, Upload, Edit, Trash2, Plus, Save, X } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  is_active: boolean;
  display_order?: number;
}

export function HeroImageManager() {
  const [realtimeSlides, setRealtimeSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: initialSlides, isLoading, error, refetch } = useQuery({
    queryKey: ['hero_slides'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hero_slides').select('*').order('display_order');
      if (error) throw error;
      return data as HeroSlide[];
    }
  });

  useEffect(() => {
    if (initialSlides) {
      setRealtimeSlides(initialSlides);
    }
  }, [initialSlides]);

  useEffect(() => {
    const channel = supabase
      .channel('hero_slides_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, (payload) => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!editingSlide || acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      setEditingSlide({ ...editingSlide, image_url: publicUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [editingSlide]);

  const dropzoneOptions: any = { onDrop, accept: {'image/*': []}, maxFiles: 1 };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleSave = async () => {
    if (!editingSlide) return;
    
    try {
      if (isCreating) {
        const { error } = await supabase
          .from('hero_slides')
          .insert([{
            title: editingSlide.title,
            subtitle: editingSlide.subtitle,
            image_url: editingSlide.image_url,
            is_active: editingSlide.is_active,
            display_order: realtimeSlides.length + 1
          }]);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .update({
            title: editingSlide.title,
            subtitle: editingSlide.subtitle,
            image_url: editingSlide.image_url,
            is_active: editingSlide.is_active
          })
          .eq('id', editingSlide.id);
        
        if (error) throw error;
      }

      setEditingSlide(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Error saving slide:", error);
      alert("Failed to save changes");
    }
  };

  const handleCreateNew = () => {
    setEditingSlide({
      id: '',
      title: 'New Slide Title',
      subtitle: 'New Slide Subtitle',
      image_url: '',
      is_active: true
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this slide?")) return;

    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      
      if (editingSlide?.id === id) {
        setEditingSlide(null);
      }
      refetch();
    } catch (error) {
      console.error("Error deleting slide:", error);
      alert("Failed to delete slide");
    }
  };

  if (isLoading) return <div className="p-8">Loading slides...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading slides. Please verify Supabase setup.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">Manage the main hero slider images and text.</p>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add New Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Slides List */}
        <div className="space-y-4">
          {realtimeSlides.map((slide) => (
            <div 
              key={slide.id} 
              className={`bg-white p-4 rounded-xl border-2 transition-colors ${editingSlide?.id === slide.id && !isCreating ? 'border-[#E67A3A]' : 'border-gray-200'} flex gap-4 cursor-pointer relative group`}
              onClick={() => {
                setEditingSlide(slide);
                setIsCreating(false);
              }}
            >
              <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 truncate">{slide.title}</h3>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">{slide.subtitle}</p>
              </div>

              <button
                onClick={(e) => handleDelete(slide.id, e)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {realtimeSlides.length === 0 && (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No hero slides found. Click "Add New Slide" to create one.
            </div>
          )}
        </div>

        {/* Edit Panel */}
        {editingSlide && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'Create New Slide' : 'Edit Slide'}</h2>
              <button 
                onClick={() => {
                  setEditingSlide(null);
                  setIsCreating(false);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Background Image</label>
                <div 
                  {...getRootProps()} 
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
                    isDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
                  }`}
                >
                  <input {...getInputProps()} />
                  {editingSlide.image_url ? (
                    <>
                      <img src={editingSlide.image_url} alt="Hero Background" className="w-full h-full object-cover" />
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input 
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle</label>
                <textarea 
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none h-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={editingSlide.is_active}
                  onChange={(e) => setEditingSlide({...editingSlide, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#E67A3A] rounded focus:ring-[#E67A3A]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Set as active slide</label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setEditingSlide(null);
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
                  <Save size={16} /> {isCreating ? 'Create Slide' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
