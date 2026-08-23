import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, Edit, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  is_active: boolean;
}

export function EventsManager() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false });
      if (error) throw error;
      return data as Event[];
    }
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !editingEvent) return;
    
    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('website-assets')
        .upload(`events/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website-assets')
        .getPublicUrl(`events/${fileName}`);

      setEditingEvent({ ...editingEvent, image_url: publicUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const dropzoneOptions: any = { onDrop, accept: {'image/*': []}, maxFiles: 1 };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleSave = async () => {
    if (!editingEvent) return;
    
    try {
      const eventData = {
        title: editingEvent.title,
        slug: editingEvent.slug || editingEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: editingEvent.description,
        event_date: editingEvent.event_date,
        location: editingEvent.location,
        image_url: editingEvent.image_url,
        is_active: editingEvent.is_active
      };

      if (isCreating) {
        const { error } = await supabase.from('events').insert(eventData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').update(eventData).eq('id', editingEvent.id);
        if (error) throw error;
      }
      
      setEditingEvent(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save changes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingEvent({
      id: '',
      title: '',
      slug: '',
      description: '',
      event_date: new Date().toISOString().slice(0, 16),
      location: '',
      image_url: '',
      is_active: true
    });
  };

  if (isLoading) return <div className="p-8">Loading events...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading events.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Manager</h1>
          <p className="text-gray-500 mt-1">Manage upcoming and past events.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#E67A3A] hover:bg-[#c9662d] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add New Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {events?.map((event) => (
            <div 
              key={event.id} 
              className={`bg-white p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row gap-4 cursor-pointer ${
                editingEvent?.id === event.id ? 'border-[#E67A3A]' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setIsCreating(false);
                setEditingEvent(event);
              }}
            >
              <div className="w-full sm:w-40 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{event.title}</h3>
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full flex-shrink-0 ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {event.is_active ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#E67A3A]" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    {event.location}
                  </div>
                </div>
              </div>
              <div className="sm:border-l sm:border-gray-100 sm:pl-4 flex sm:flex-col justify-end sm:justify-start gap-2 pt-4 sm:pt-0 border-t border-gray-100 sm:border-t-0 mt-4 sm:mt-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(event.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {(!events || events.length === 0) && (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
              <Calendar size={48} className="mb-3 text-gray-300" />
              <p className="font-medium">No events found</p>
            </div>
          )}
        </div>

        {/* Edit Panel */}
        <div className="lg:col-span-1">
          {editingEvent ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{isCreating ? 'New Event' : 'Edit Event'}</h2>
                <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Event Image</label>
                  <div 
                    {...getRootProps()} 
                    className={`relative h-40 rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
                      isDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {editingEvent.image_url ? (
                      <>
                        <img src={editingEvent.image_url} alt="Event" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <ImageIcon size={16} /> Replace Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ImageIcon size={28} className="mb-2 text-gray-400 group-hover:text-[#E67A3A] transition-colors" />
                        <span className="text-sm font-medium">Upload Image</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-[#E67A3A] border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input 
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={editingEvent.event_date.slice(0, 16)}
                      onChange={(e) => setEditingEvent({...editingEvent, event_date: new Date(e.target.value).toISOString()})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                    <input 
                      type="text"
                      value={editingEvent.location}
                      onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm h-32 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={editingEvent.is_active}
                    onChange={(e) => setEditingEvent({...editingEvent, is_active: e.target.checked})}
                    className="w-4 h-4 text-[#E67A3A] rounded border-gray-300 focus:ring-[#E67A3A]"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Publish Event</label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button 
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!editingEvent.title}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save size={16} /> {isCreating ? 'Create Event' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500 h-64 sticky top-8">
              <Calendar size={48} className="mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">No event selected</p>
              <p className="text-sm mt-1">Select an event from the list to edit, or click "Add New Event".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
