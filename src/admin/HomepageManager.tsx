import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Save, Plus, Trash2, CheckCircle2, Loader2, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';

export function HomepageManager() {
  const [activeTab, setActiveTab] = useState<'stats' | 'features' | 'why' | 'experiences'>('stats');
  const [experiences, setExperiences] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States for each section
  const [stats, setStats] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [why, setWhy] = useState<any>({ title: '', subtitle: '', list: [], image_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `why_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setWhy((prev: any) => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, []);
  const dropzoneOptions: any = { onDrop, accept: {'image/*': []}, maxFiles: 1 };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const [merch, setMerch] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('categories').select('*');
      if (data) {
        data.forEach(row => {
          try {
            const parsed = JSON.parse(row.description || 'null');
            if (!parsed) return;
            if (row.slug === 'homepage-stats') setStats(parsed);
            if (row.slug === 'homepage-features') setFeatures(parsed);
            if (row.slug === 'homepage-why-choose-us') setWhy(parsed);
            if (row.slug === 'homepage-merch-store') setMerch(parsed);
            if (row.slug === 'homepage-experiences') setExperiences(parsed);
          } catch (e) {}
        });
      }
    }
    fetchData();
  }, []);

  const handleSave = async (slug: string, data: any) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name: slug.replace(/-/g, ' ').toUpperCase(),
        slug,
        description: JSON.stringify(data)
      };

      // Check if exists
      const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).single();

      if (existing) {
        await supabase.from('categories').update(payload).eq('slug', slug);
      } else {
        await supabase.from('categories').insert(payload);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  
  const handleExperienceUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `exp_${id}_${Date.now()}.${fileExt}`;
    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setExperiences(prev => ({ ...prev, [id]: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  
  const experienceCards = [
    { id: 'nganya', title: 'Nganya Experience', hasVideo: true },
    { id: 'roadtrips', title: 'Road Trips & Adventures' },
    { id: 'weddings', title: 'Weddings & Ruracio Transport' },
    { id: 'safari', title: 'Safari Tours' },
    { id: 'coaster', title: 'Coaster & Group Hire' },
    { id: 'private', title: 'Private Car Hire' }
  ];

  const handleVideoUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `exp_vid_${id}_${Date.now()}.${fileExt}`;
    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setExperiences(prev => ({ ...prev, [id + '_video']: publicUrl }));
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const renderExperiences = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Our Experiences Media</h3>
        <button onClick={() => handleSave('homepage-experiences', experiences)} disabled={isSaving} className="bg-[#FF6A00] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experienceCards.map(card => (
          <div key={card.id} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
            <h4 className="font-bold">{card.title}</h4>
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">Image</label>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-2">
                  {experiences[card.id] ? (
                    <img src={experiences[card.id]} alt={card.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                    <Upload className="w-6 h-6 mr-2" /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleExperienceUpload(card.id, e)} className="hidden" />
                  </label>
                </div>
                <input type="text" placeholder="Image URL" value={experiences[card.id] || ''} onChange={(e) => setExperiences(prev => ({...prev, [card.id]: e.target.value}))} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
              </div>
              
              {card.hasVideo && (
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">Video</label>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-2">
                    {experiences[card.id + '_video'] ? (
                      <video src={experiences[card.id + '_video']} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Video
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                      <Upload className="w-6 h-6 mr-2" /> Upload
                      <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(card.id, e)} className="hidden" />
                    </label>
                  </div>
                  <input type="text" placeholder="Video URL" value={experiences[card.id + '_video'] || ''} onChange={(e) => setExperiences(prev => ({...prev, [card.id + '_video']: e.target.value}))} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  const renderStats = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Stats Counter</h3>
      {stats.map((stat, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Value (Number)</label>
            <input type="number" value={stat.value} onChange={(e) => {
              const newStats = [...stats];
              newStats[idx].value = Number(e.target.value);
              setStats(newStats);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Suffix (e.g. + or %)</label>
            <input type="text" value={stat.suffix} onChange={(e) => {
              const newStats = [...stats];
              newStats[idx].suffix = e.target.value;
              setStats(newStats);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Label</label>
            <input type="text" value={stat.label} onChange={(e) => {
              const newStats = [...stats];
              newStats[idx].label = e.target.value;
              setStats(newStats);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div className="flex items-end pb-2">
            <button onClick={() => setStats(stats.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => setStats([...stats, { value: 0, suffix: '', label: '', format: true }])} className="text-[#FF6A00] font-bold flex items-center gap-2 text-sm mt-4">
        <Plus className="w-4 h-4" /> Add Stat
      </button>
      <div className="mt-8 flex justify-end">
        <button onClick={() => handleSave('homepage-stats', stats)} disabled={isSaving} className="bg-[#FF6A00] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Stats
        </button>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Feature Bar</h3>
      {features.map((feature, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Title</label>
            <input type="text" value={feature.name} onChange={(e) => {
              const newF = [...features];
              newF[idx].name = e.target.value;
              setFeatures(newF);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">Description</label>
            <input type="text" value={feature.desc} onChange={(e) => {
              const newF = [...features];
              newF[idx].desc = e.target.value;
              setFeatures(newF);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div className="flex items-end pb-2 justify-between">
            <button onClick={() => setFeatures(features.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => setFeatures([...features, { name: '', desc: '', icon: 'CheckCircle2' }])} className="text-[#FF6A00] font-bold flex items-center gap-2 text-sm mt-4">
        <Plus className="w-4 h-4" /> Add Feature
      </button>
      <div className="mt-8 flex justify-end">
        <button onClick={() => handleSave('homepage-features', features)} disabled={isSaving} className="bg-[#FF6A00] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Features
        </button>
      </div>
    </div>
  );

  const renderWhy = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Why Choose Us</h3>
      
      <div className="mb-6">
        <label className="block text-sm text-gray-500 mb-1">Section Image</label>
        <div 
          {...getRootProps()} 
          className={`relative aspect-[4/3] max-w-sm rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-colors group ${
            isDragActive ? 'border-[#E67A3A] bg-[#E67A3A]/5' : 'border-gray-300 bg-gray-50 hover:border-[#E67A3A]'
          }`}
        >
          <input {...getInputProps()} />
          {why.image_url ? (
            <>
              <img src={why.image_url} alt="Why Choose Us" className="w-full h-full object-cover" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Title</label>
          <input type="text" value={why.title || ''} onChange={(e) => setWhy({...why, title: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Subtitle</label>
          <input type="text" value={why.subtitle || ''} onChange={(e) => setWhy({...why, subtitle: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2" />
        </div>
      </div>

      
      <h4 className="font-bold text-sm text-gray-500 mb-2 uppercase">Reasons</h4>
      {(why.list || []).map((item: any, idx: number) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4">
          <div className="flex-1 space-y-2">
            <input type="text" placeholder="Title" value={item.title} onChange={(e) => {
              const newList = [...(why.list || [])];
              newList[idx].title = e.target.value;
              setWhy({...why, list: newList});
            }} className="w-full border border-gray-200 rounded-lg p-2 font-bold" />
            <textarea placeholder="Description" value={item.desc} onChange={(e) => {
              const newList = [...(why.list || [])];
              newList[idx].desc = e.target.value;
              setWhy({...why, list: newList});
            }} className="w-full border border-gray-200 rounded-lg p-2 text-sm h-20" />
          </div>
          <div className="flex items-center">
            <button onClick={() => {
              const newList = (why.list || []).filter((_: any, i: number) => i !== idx);
              setWhy({...why, list: newList});
            }} className="text-red-500 hover:text-red-700 p-2">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => setWhy({...why, list: [...(why.list || []), { title: '', desc: '' }]})} className="text-[#FF6A00] font-bold flex items-center gap-2 text-sm mt-4">
        <Plus className="w-4 h-4" /> Add Reason
      </button>

      <div className="mt-8 flex justify-end">
        <button onClick={() => handleSave('homepage-why-choose-us', why)} disabled={isSaving} className="bg-[#FF6A00] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Content
        </button>
      </div>
    </div>
  );

  const renderMerch = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Merch Store</h3>
      {merch.map((prod, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Product Name</label>
            <input type="text" value={prod.name} onChange={(e) => {
              const newM = [...merch];
              newM[idx].name = e.target.value;
              setMerch(newM);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Price (e.g. $65)</label>
            <input type="text" value={prod.price} onChange={(e) => {
              const newM = [...merch];
              newM[idx].price = e.target.value;
              setMerch(newM);
            }} className="w-full border border-gray-200 rounded-lg p-2" />
          </div>
          <div className="md:col-span-2 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-1">Image URL</label>
              <input type="text" value={prod.img} onChange={(e) => {
                const newM = [...merch];
                newM[idx].img = e.target.value;
                setMerch(newM);
              }} className="w-full border border-gray-200 rounded-lg p-2" />
            </div>
            <div className="flex items-end pb-2">
              <button onClick={() => setMerch(merch.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => setMerch([...merch, { id: Math.random().toString(), name: '', price: '', img: '' }])} className="text-[#FF6A00] font-bold flex items-center gap-2 text-sm mt-4">
        <Plus className="w-4 h-4" /> Add Product
      </button>
      <div className="mt-8 flex justify-end">
        <button onClick={() => handleSave('homepage-merch-store', merch)} disabled={isSaving} className="bg-[#FF6A00] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Merch
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-['Poppins'] uppercase tracking-tight text-gray-900 mb-2">
          Homepage Content
        </h1>
        <p className="text-gray-500">Manage dynamic sections on the main landing page.</p>
      </div>

      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="font-bold">Content saved successfully!</span>
        </motion.div>
      )}

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button onClick={() => setActiveTab('stats')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm ${activeTab === 'stats' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Stats Counter</button>
        <button onClick={() => setActiveTab('features')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm ${activeTab === 'features' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Feature Bar</button>
        <button onClick={() => setActiveTab('why')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm ${activeTab === 'why' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Why Choose Us</button>
        <button onClick={() => setActiveTab('experiences')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm ${activeTab === 'experiences' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Our Experiences</button>
      </div>

      <div className="max-w-4xl">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'features' && renderFeatures()}
        {activeTab === 'why' && renderWhy()}
        {activeTab === 'experiences' && renderExperiences()}
      </div>
    </div>
  );
}
