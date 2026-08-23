import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useHeroVideos } from '../hooks/useSupabaseData';
import { useDropzone } from 'react-dropzone';
import { Video, Image as ImageIcon, Upload, Trash2, Plus, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface HeroVideo {
  id: string;
  video_url: string;
  poster_url: string;
  title: string;
  subtitle: string;
  is_active: boolean;
  display_order: number;
}

export function HeroVideoManager() {
  const { data: videos, isLoading, refetch } = useHeroVideos();
  const [editingVideo, setEditingVideo] = useState<HeroVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveVideos = async (newVideos: HeroVideo[]) => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase.from('categories').select('id').eq('slug', 'homepage-hero-videos').single();
      const payload = {
        name: 'HOMEPAGE HERO VIDEOS',
        slug: 'homepage-hero-videos',
        description: JSON.stringify(newVideos)
      };

      if (existing) {
        await supabase.from('categories').update(payload).eq('slug', 'homepage-hero-videos');
      } else {
        await supabase.from('categories').insert(payload);
      }
      refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to save videos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setEditingVideo({
      id: uuidv4(),
      video_url: '',
      poster_url: '',
      title: '',
      subtitle: '',
      is_active: true,
      display_order: (videos?.length || 0) + 1
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this video?")) return;
    const newVideos = (videos || []).filter(v => v.id !== id);
    await saveVideos(newVideos);
    if (editingVideo?.id === id) setEditingVideo(null);
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;
    let newVideos = [...(videos || [])];
    const index = newVideos.findIndex(v => v.id === editingVideo.id);
    if (index >= 0) {
      newVideos[index] = editingVideo;
    } else {
      newVideos.push(editingVideo);
    }
    await saveVideos(newVideos);
    setEditingVideo(null);
  };

  const onDropVideo = async (acceptedFiles: File[]) => {
    if (!editingVideo || acceptedFiles.length === 0) return;
    
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
        
      setEditingVideo({ ...editingVideo, video_url: publicUrl });
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  const onDropPoster = async (acceptedFiles: File[]) => {
    if (!editingVideo || acceptedFiles.length === 0) return;
    
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
        
      setEditingVideo({ ...editingVideo, poster_url: publicUrl });
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Failed to upload poster");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({ onDrop: onDropVideo, maxFiles: 1, accept: { 'video/*': [] } } as any);
  
  const { getRootProps: getPosterRootProps, getInputProps: getPosterInputProps, isDragActive: isPosterDragActive } = useDropzone({ onDrop: onDropPoster, maxFiles: 1, accept: { 'image/*': [] } } as any);

  if (isLoading) return <div className="p-8">Loading videos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">Manage hero background videos.</p>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add New Video</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List */}
        <div className="space-y-4">
          {(videos || []).map((video: HeroVideo) => (
            <div 
              key={video.id} 
              className={`bg-white p-4 rounded-xl border-2 transition-colors ${editingVideo?.id === video.id ? 'border-[#E67A3A]' : 'border-gray-200'} flex gap-4 cursor-pointer relative group`}
              onClick={() => setEditingVideo(video)}
            >
              <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                {video.poster_url ? (
                  <img src={video.poster_url} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
                {video.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video size={24} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 truncate">{video.title || 'Untitled Video'}</h3>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${video.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {video.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">{video.subtitle || 'No subtitle'}</p>
              </div>
              
              <button
                onClick={(e) => handleDelete(video.id, e)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!videos || videos.length === 0) && (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No hero videos found. Click "Add New Video" to create one.
            </div>
          )}
        </div>

        {/* Edit Panel */}
        {editingVideo && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Video</h2>
              <button onClick={() => setEditingVideo(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Video Upload */}
              <div 
                {...getVideoRootProps()} 
                className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
                  isVideoDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
                }`}
              >
                <input {...getVideoInputProps()} />
                {editingVideo.video_url ? (
                  <>
                    <video src={editingVideo.video_url} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Upload size={18} className="mb-1" />
                      <span className="font-medium text-sm">Replace Video</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Video size={24} className="mb-2 text-gray-400" />
                    <span className="text-sm font-medium">Click or drag video to upload (.mp4, .webm)</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[#E67A3A] border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Or paste video URL here"
                value={editingVideo.video_url}
                onChange={(e) => setEditingVideo({...editingVideo, video_url: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />

              {/* Poster Upload */}
              <div 
                {...getPosterRootProps()} 
                className={`relative h-24 rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
                  isPosterDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
                }`}
              >
                <input {...getPosterInputProps()} />
                {editingVideo.poster_url ? (
                  <>
                    <img src={editingVideo.poster_url} className="w-full h-full object-cover" alt="Poster" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Upload size={16} className="mb-1" />
                      <span className="font-medium text-xs">Replace Poster Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ImageIcon size={20} className="mb-1 text-gray-400" />
                    <span className="text-xs font-medium">Upload Poster / Fallback Image</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-[#E67A3A] border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title (Optional)</label>
                <input 
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle (Optional)</label>
                <textarea 
                  value={editingVideo.subtitle}
                  onChange={(e) => setEditingVideo({...editingVideo, subtitle: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none h-20"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActiveVideo"
                  checked={editingVideo.is_active}
                  onChange={(e) => setEditingVideo({...editingVideo, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#E67A3A] rounded focus:ring-[#E67A3A]"
                />
                <label htmlFor="isActiveVideo" className="text-sm font-medium text-gray-700">Set as active video</label>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isUploading || isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
