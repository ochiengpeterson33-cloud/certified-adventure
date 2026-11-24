import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, CheckCircle2, Loader2, Upload, Image as ImageIcon, Video, X, AlertCircle, Sparkles, ArrowUp, ArrowDown, Vote, RotateCcw, Clock, Copy } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';
import { DEFAULT_CULTURE_POLLS, CulturePoll, PollStatusMode, resolvePollStatus, useCulturePollVotes } from '../hooks/useSupabaseData';

const POLLS_SETUP_SQL = `CREATE TABLE IF NOT EXISTS culture_poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  voter_token TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (poll_id, voter_token)
);
CREATE UNIQUE INDEX IF NOT EXISTS culture_poll_votes_poll_user_idx ON culture_poll_votes (poll_id, user_id) WHERE user_id IS NOT NULL;
ALTER TABLE culture_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read culture_poll_votes" ON culture_poll_votes FOR SELECT TO public USING (true);
CREATE POLICY "Public insert culture_poll_votes" ON culture_poll_votes FOR INSERT TO anon, authenticated WITH CHECK (char_length(trim(poll_id)) > 0 AND char_length(trim(option_id)) > 0 AND char_length(trim(voter_token)) >= 8);
CREATE POLICY "Admin delete culture_poll_votes" ON culture_poll_votes FOR DELETE TO authenticated USING (true);`;

function isoToLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface HomepageManagerProps {
  initialTab?: 'stats' | 'features' | 'why' | 'experiences';
}

export function HomepageManager({ initialTab = 'stats' }: HomepageManagerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'stats' | 'features' | 'why' | 'experiences'>(initialTab);
  const [experiences, setExperiences] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync tab when navigating between /admin/polls and /admin/homepage
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // States for each section
  const [stats, setStats] = useState<any[]>([]);
  const [polls, setPolls] = useState<CulturePoll[]>([]);
  const [pollsLoaded, setPollsLoaded] = useState(false);
  const [why, setWhy] = useState<any>({ title: '', subtitle: '', list: [], image_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const { data: liveVotesData } = useCulturePollVotes();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    setUploadingTarget('why');
    setErrorMsg(null);
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
      setErrorMsg("Failed to upload image. Please check the file and try again.");
    } finally {
      setIsUploading(false);
      setUploadingTarget(null);
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
            if (row.slug === 'homepage-culture-polls' && Array.isArray(parsed)) {
              setPolls(parsed);
            }
            if (row.slug === 'homepage-why-choose-us') setWhy(parsed);
            if (row.slug === 'homepage-merch-store') setMerch(parsed);
            if (row.slug === 'homepage-experiences') setExperiences(parsed);
          } catch (e) {}
        });
      }
      setPollsLoaded(true);
    }
    fetchData();
  }, []);

  const handleSave = async (slug: string, data: any) => {
    setSaveSuccess(false);
    setErrorMsg(null);

    if (slug === 'homepage-culture-polls' && Array.isArray(data)) {
      const invalidPoll = (data as CulturePoll[]).find(
        (p) => !p.question?.trim() || (p.options || []).filter((o) => o.title?.trim()).length < 2
      );
      if (invalidPoll) {
        setErrorMsg('Every poll must have a question and at least 2 named voting choices before saving.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        name: slug.replace(/-/g, ' ').toUpperCase(),
        slug,
        description: JSON.stringify(data)
      };

      const { data: existing, error: fetchErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      if (existing) {
        const { error } = await supabase.from('categories').update(payload).eq('slug', slug);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }

      if (slug === 'homepage-experiences') {
        queryClient.invalidateQueries({ queryKey: ['homepage-experiences'] });
      } else if (slug === 'homepage-why-choose-us') {
        queryClient.invalidateQueries({ queryKey: ['categories-why'] });
      } else if (slug === 'homepage-culture-polls') {
        queryClient.invalidateQueries({ queryKey: ['homepage-culture-polls'] });
        queryClient.invalidateQueries({ queryKey: ['culture-poll-votes'] });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving:", error);
      setErrorMsg(error?.message || "Failed to save changes. Please verify you are signed in as an Admin and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePollOptionImageUpload = async (
    pollIdx: number,
    optIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `poll_${pollIdx}_${optIdx}_${Date.now()}.${fileExt}`;
    setIsUploading(true);
    setUploadingTarget(`poll_${pollIdx}_opt_${optIdx}`);
    setErrorMsg(null);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setPolls(prev =>
        prev.map((poll, pIdx) =>
          pIdx === pollIdx
            ? {
                ...poll,
                options: poll.options.map((opt, oIdx) =>
                  oIdx === optIdx ? { ...opt, image_url: publicUrl } : opt
                ),
              }
            : poll
        )
      );
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to upload option image.');
    } finally {
      setIsUploading(false);
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const movePoll = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= polls.length) return;
    const next = [...polls];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    setPolls(next);
  };

  const handleResetPollVotes = async (pollId: string) => {
    try {
      await supabase.from('culture_poll_votes').delete().eq('poll_id', pollId);
      queryClient.invalidateQueries({ queryKey: ['culture-poll-votes'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExperienceUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `exp_${id}_${Date.now()}.${fileExt}`;
    setIsUploading(true);
    setUploadingTarget(`img_${id}`);
    setErrorMsg(null);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setExperiences(prev => ({ ...prev, [id]: publicUrl }));
    } catch (err) {
      console.error(err);
      setErrorMsg('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `exp_vid_${id}_${Date.now()}.${fileExt}`;
    setIsUploading(true);
    setUploadingTarget(`vid_${id}`);
    setErrorMsg(null);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setExperiences(prev => ({ ...prev, [id + '_video']: publicUrl }));
    } catch (err) {
      console.error(err);
      setErrorMsg('Video upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const handleSectionBgUpload = async (mediaType: 'image' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `exp_section_bg_${mediaType}_${Date.now()}.${fileExt}`;
    setIsUploading(true);
    setUploadingTarget(`section_${mediaType}`);
    setErrorMsg(null);
    try {
      const { error: uploadError } = await supabase.storage.from('website-assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(fileName);
      setExperiences(prev => ({
        ...prev,
        section_bg_type: mediaType,
        [mediaType === 'image' ? 'section_bg_image' : 'section_bg_video']: publicUrl,
      }));
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to upload section background ${mediaType}.`);
    } finally {
      setIsUploading(false);
      setUploadingTarget(null);
      e.target.value = '';
    }
  };

  const experienceCards = [
    { id: 'nganya', title: 'Nganya Experience' },
    { id: 'roadtrips', title: 'Road Trips & Adventures' },
    { id: 'weddings', title: 'Weddings & Ruracio Transport' },
    { id: 'safari', title: 'Safari Tours' },
    { id: 'coaster', title: 'Coaster & Group Hire' },
    { id: 'private', title: 'Private Car Hire' }
  ];

  const sectionBgType = (experiences.section_bg_type as 'none' | 'image' | 'video') ||
    (experiences.section_bg_video ? 'video' : experiences.section_bg_image ? 'image' : 'none');
  const sectionBgOverlay = experiences.section_bg_overlay || '60';

  const previewOverlayClass: Record<string, string> = {
    '40': 'bg-[#08121B]/45',
    '60': 'bg-[#08121B]/60',
    '75': 'bg-[#08121B]/75',
    '85': 'bg-[#08121B]/85',
  };

  const renderExperiences = () => (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Explore Our Experiences</h3>
          <p className="text-sm text-gray-500">Customize the section background (video or image) and individual card media.</p>
        </div>
        <button
          onClick={() => handleSave('homepage-experiences', experiences)}
          disabled={isSaving || isUploading}
          className="bg-[#FF6A00] hover:bg-[#e65c00] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Section Background Manager (Video or Image) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Section Background Media</h4>
              <p className="text-xs text-gray-500">Set an atmospheric video or photo behind the Explore Our Experiences section.</p>
            </div>
          </div>

          {/* Background Type Toggle */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1 self-start sm:self-auto">
            {[
              { value: 'none', label: 'Default' },
              { value: 'image', label: 'Image', icon: ImageIcon },
              { value: 'video', label: 'Video', icon: Video },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperiences(prev => ({ ...prev, section_bg_type: opt.value }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sectionBgType === opt.value
                    ? 'bg-white text-[#FF6A00] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Uploaders & URL Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Background Image Box */}
          <div className={`p-4 rounded-xl border transition-colors ${sectionBgType === 'image' ? 'border-[#FF6A00]/50 bg-orange-50/20' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Background Image {sectionBgType === 'video' ? '(Poster Fallback)' : ''}</span>
              </label>
              {experiences.section_bg_image && (
                <button
                  type="button"
                  onClick={() => setExperiences(prev => ({
                    ...prev,
                    section_bg_image: '',
                    section_bg_type: prev.section_bg_type === 'image' ? 'none' : prev.section_bg_type
                  }))}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-3">
              {experiences.section_bg_image ? (
                <img src={experiences.section_bg_image} alt="Experiences section background" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1.5" />
                  <span className="text-xs">Upload JPG, PNG, or WEBP background image</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity">
                {uploadingTarget === 'section_image' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {uploadingTarget === 'section_image' ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={(e) => handleSectionBgUpload('image', e)} className="hidden" />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste background image URL..."
                value={experiences.section_bg_image || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setExperiences(prev => ({
                    ...prev,
                    section_bg_image: val,
                    section_bg_type: val && (!prev.section_bg_type || prev.section_bg_type === 'none') ? 'image' : prev.section_bg_type
                  }));
                }}
                className="flex-1 min-w-0 border border-gray-200 bg-white rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
              <label className="px-3 py-2 rounded-lg bg-gray-900 hover:bg-[#FF6A00] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>File</span>
                <input type="file" accept="image/*" onChange={(e) => handleSectionBgUpload('image', e)} className="hidden" />
              </label>
            </div>
          </div>

          {/* Background Video Box */}
          <div className={`p-4 rounded-xl border transition-colors ${sectionBgType === 'video' ? 'border-[#FF6A00]/50 bg-orange-50/20' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Background Video (.mp4, .webm)</span>
              </label>
              {experiences.section_bg_video && (
                <button
                  type="button"
                  onClick={() => setExperiences(prev => ({
                    ...prev,
                    section_bg_video: '',
                    section_bg_type: prev.section_bg_type === 'video' ? (prev.section_bg_image ? 'image' : 'none') : prev.section_bg_type
                  }))}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-3">
              {experiences.section_bg_video ? (
                <video
                  src={experiences.section_bg_video}
                  poster={experiences.section_bg_image || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <Video className="w-8 h-8 opacity-40 mb-1.5" />
                  <span className="text-xs">Upload looping MP4 or WebM background video</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity">
                {uploadingTarget === 'section_video' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {uploadingTarget === 'section_video' ? 'Uploading...' : 'Upload Video'}
                <input type="file" accept="video/*" onChange={(e) => handleSectionBgUpload('video', e)} className="hidden" />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste background video URL..."
                value={experiences.section_bg_video || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setExperiences(prev => ({
                    ...prev,
                    section_bg_video: val,
                    section_bg_type: val ? 'video' : (prev.section_bg_image ? 'image' : 'none')
                  }));
                }}
                className="flex-1 min-w-0 border border-gray-200 bg-white rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
              <label className="px-3 py-2 rounded-lg bg-gray-900 hover:bg-[#FF6A00] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>File</span>
                <input type="file" accept="video/*" onChange={(e) => handleSectionBgUpload('video', e)} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Overlay Readability Strength + Mini Live Preview */}
        {sectionBgType !== 'none' && ((sectionBgType === 'video' && experiences.section_bg_video) || (sectionBgType === 'image' && experiences.section_bg_image)) && (
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Background Overlay Intensity (Text Readability)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: '40', label: 'Vivid (40%)' },
                  { value: '60', label: 'Balanced (60%)' },
                  { value: '75', label: 'Contrast (75%)' },
                  { value: '85', label: 'Subtle (85%)' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setExperiences(prev => ({ ...prev, section_bg_overlay: preset.value }))}
                    className={`px-2.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      sectionBgOverlay === preset.value
                        ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#FF6A00]/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              {sectionBgType === 'video' && experiences.section_bg_video ? (
                <video
                  src={experiences.section_bg_video}
                  poster={experiences.section_bg_image || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={experiences.section_bg_image}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className={`absolute inset-0 ${previewOverlayClass[sectionBgOverlay] || 'bg-[#08121B]/60'}`} />
              <div className="relative z-10 text-center px-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF6A00]">Live Preview</p>
                <p className="text-sm font-black uppercase text-white tracking-tight">Explore Our Experiences</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Individual Experience Cards Media */}
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-3">Experience Card Media</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experienceCards.map(card => (
            <div key={card.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
              <h5 className="font-bold text-gray-900">{card.title}</h5>
              <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Card Image</label>
                    {experiences[card.id] && (
                      <button
                        type="button"
                        onClick={() => setExperiences(prev => ({ ...prev, [card.id]: '' }))}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-2">
                    {experiences[card.id] ? (
                      <img src={experiences[card.id]} alt={card.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity">
                      {uploadingTarget === `img_${card.id}` ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handleExperienceUpload(card.id, e)} className="hidden" />
                    </label>
                  </div>
                  <input type="text" placeholder="Image URL" value={experiences[card.id] || ''} onChange={(e) => setExperiences(prev => ({...prev, [card.id]: e.target.value}))} className="w-full border border-gray-200 rounded-lg p-2 text-xs sm:text-sm" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Card Video (Optional)</label>
                    {experiences[card.id + '_video'] && (
                      <button
                        type="button"
                        onClick={() => setExperiences(prev => ({ ...prev, [card.id + '_video']: '' }))}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border border-gray-200 mb-2">
                    {experiences[card.id + '_video'] ? (
                      <video src={experiences[card.id + '_video']} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Video
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity">
                      {uploadingTarget === `vid_${card.id}` ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                      Upload
                      <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(card.id, e)} className="hidden" />
                    </label>
                  </div>
                  <input type="text" placeholder="Video URL" value={experiences[card.id + '_video'] || ''} onChange={(e) => setExperiences(prev => ({...prev, [card.id + '_video']: e.target.value}))} className="w-full border border-gray-200 rounded-lg p-2 text-xs sm:text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
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

  const getOptionLiveVotes = (pollId: string, optionId: string) => {
    const remoteRows = liveVotesData?.rows || [];
    return remoteRows.filter(
      (r) => r.poll_id === pollId && r.option_id === optionId
    ).length;
  };

  const renderFeatures = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Vote className="w-5 h-5 text-[#FF6A00]" />
            <span>Certified Adventures Vuka Mwaka Awards 2026</span>
          </h3>
          <p className="text-sm text-gray-500">
            Create interactive award polls with thumbnails, LIVE/OPEN/CLOSED status control, and automatic expiry deadlines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setPolls([
                {
                  id: `poll-${Date.now()}`,
                  question: '',
                  category: 'Vuka Mwaka Awards 2026',
                  subtitle: '',
                  status: 'live',
                  closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  is_active: true,
                  options: [
                    { id: `opt-${Date.now()}-1`, title: '', subtitle: '', image_url: '' },
                    { id: `opt-${Date.now()}-2`, title: '', subtitle: '', image_url: '' },
                  ],
                },
                ...polls,
              ])
            }
            className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Poll</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave('homepage-culture-polls', polls)}
            disabled={isSaving || isUploading}
            className="bg-[#FF6A00] hover:bg-[#e65c00] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Polls</span>
          </button>
        </div>
      </div>

      {liveVotesData && !liveVotesData.tableAvailable && (
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-200">
            <strong className="text-[#FF6A00]">Database Setup Required for Shared Voting:</strong> Run the `culture_poll_votes` SQL in your Supabase SQL Editor so votes sync across all visitors in real time.
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(POLLS_SETUP_SQL);
              setCopiedSql(true);
              setTimeout(() => setCopiedSql(false), 2500);
            }}
            className="px-3.5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#e65c00] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedSql ? 'SQL Copied!' : 'Copy Setup SQL'}</span>
          </button>
        </div>
      )}

      <div className="space-y-5">
        {polls.map((poll, pollIdx) => {
          const resolvedStatus = resolvePollStatus(poll);
          const totalPollVotes = poll.options.reduce(
            (sum, o) => sum + getOptionLiveVotes(poll.id, o.id),
            0
          );

          return (
            <div key={poll.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              {/* Poll Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FF6A00]/15 text-[#FF6A00] text-xs font-black flex items-center justify-center">
                    {pollIdx + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      resolvedStatus === 'LIVE'
                        ? 'bg-orange-100 text-[#FF6A00]'
                        : resolvedStatus === 'OPEN'
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {resolvedStatus}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 tabular-nums">
                    {totalPollVotes} total votes
                  </span>
                  <label className="inline-flex items-center gap-1.5 ml-2 text-xs font-semibold text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={poll.is_active !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPolls((prev) =>
                          prev.map((p, idx) => (idx === pollIdx ? { ...p, is_active: checked } : p))
                        );
                      }}
                      className="accent-[#FF6A00] w-3.5 h-3.5 rounded"
                    />
                    <span>{poll.is_active !== false ? 'Visible' : 'Hidden'}</span>
                  </label>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleResetPollVotes(poll.id)}
                    title="Reset Database Votes"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Votes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => movePoll(pollIdx, -1)}
                    disabled={pollIdx === 0}
                    title="Move Up"
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePoll(pollIdx, 1)}
                    disabled={pollIdx === polls.length - 1}
                    title="Move Down"
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolls(polls.filter((_, i) => i !== pollIdx))}
                    title="Delete Poll"
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Poll Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Which Kenyan Cultural Experience Deserves Next Feature?"
                    value={poll.question || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPolls((prev) =>
                        prev.map((p, idx) => (idx === pollIdx ? { ...p, question: val } : p))
                      );
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Culture Spotlight"
                    value={poll.category || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPolls((prev) =>
                        prev.map((p, idx) => (idx === pollIdx ? { ...p, category: val } : p))
                      );
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Poll Status Mode
                  </label>
                  <select
                    value={poll.status || 'auto'}
                    onChange={(e) => {
                      const val = e.target.value as PollStatusMode;
                      setPolls((prev) =>
                        prev.map((p, idx) => (idx === pollIdx ? { ...p, status: val } : p))
                      );
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  >
                    <option value="auto">Auto (Deadline Based)</option>
                    <option value="live">LIVE (Until Deadline)</option>
                    <option value="open">OPEN (Until Deadline)</option>
                    <option value="closed">CLOSED (Highlight Winner)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Tell visitors what they are voting on..."
                    value={poll.subtitle || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPolls((prev) =>
                        prev.map((p, idx) => (idx === pollIdx ? { ...p, subtitle: val } : p))
                      );
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Voting Deadline (Auto-Closes Poll)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="datetime-local"
                      value={isoToLocalInput(poll.closes_at)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const iso = raw ? new Date(raw).toISOString() : '';
                        setPolls((prev) =>
                          prev.map((p, idx) => (idx === pollIdx ? { ...p, closes_at: iso } : p))
                        );
                      }}
                      className="flex-1 min-w-[180px] border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const iso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                        setPolls((prev) =>
                          prev.map((p, idx) => (idx === pollIdx ? { ...p, closes_at: iso } : p))
                        );
                      }}
                      className="px-2.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
                    >
                      +24h
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const iso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                        setPolls((prev) =>
                          prev.map((p, idx) => (idx === pollIdx ? { ...p, closes_at: iso } : p))
                        );
                      }}
                      className="px-2.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
                    >
                      +7d
                    </button>
                    {poll.closes_at && (
                      <button
                        type="button"
                        onClick={() => {
                          setPolls((prev) =>
                            prev.map((p, idx) => (idx === pollIdx ? { ...p, closes_at: '' } : p))
                          );
                        }}
                        className="px-2 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Poll Choices / Nominees */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Voting Choices ({poll.options.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPolls((prev) =>
                        prev.map((p, idx) =>
                          idx === pollIdx
                            ? {
                                ...p,
                                options: [
                                  ...p.options,
                                  { id: `opt-${Date.now()}`, title: '', subtitle: '', image_url: '' },
                                ],
                              }
                            : p
                        )
                      );
                    }}
                    className="text-xs font-bold text-[#FF6A00] hover:text-[#e65c00] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Choice</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {poll.options.map((opt, optIdx) => {
                    const totalOptVotes = getOptionLiveVotes(poll.id, opt.id);
                    return (
                      <div
                        key={opt.id}
                        className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                            Choice #{optIdx + 1} Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Nairobi Nganya Night Tour"
                            value={opt.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPolls((prev) =>
                                prev.map((p, pIdx) =>
                                  pIdx === pollIdx
                                    ? {
                                        ...p,
                                        options: p.options.map((o, oIdx) =>
                                          oIdx === optIdx ? { ...o, title: val } : o
                                        ),
                                      }
                                    : p
                                )
                              );
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                            Short Description
                          </label>
                          <input
                            type="text"
                            placeholder="Short description..."
                            value={opt.subtitle || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPolls((prev) =>
                                prev.map((p, pIdx) =>
                                  pIdx === pollIdx
                                    ? {
                                        ...p,
                                        options: p.options.map((o, oIdx) =>
                                          oIdx === optIdx ? { ...o, subtitle: val } : o
                                        ),
                                      }
                                    : p
                                )
                              );
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF6A00]"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                            Thumbnail Image
                          </label>
                          <div className="flex items-center gap-2">
                            {opt.image_url && (
                              <img
                                src={opt.image_url}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                            )}
                            <input
                              type="text"
                              placeholder="Thumbnail URL..."
                              value={opt.image_url || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPolls((prev) =>
                                  prev.map((p, pIdx) =>
                                    pIdx === pollIdx
                                      ? {
                                          ...p,
                                          options: p.options.map((o, oIdx) =>
                                            oIdx === optIdx ? { ...o, image_url: val } : o
                                          ),
                                        }
                                      : p
                                  )
                                );
                              }}
                              className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#FF6A00]"
                            />
                            <label className="px-2.5 py-2 rounded-lg bg-gray-900 hover:bg-[#FF6A00] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0">
                              {uploadingTarget === `poll_${pollIdx}_opt_${optIdx}` ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePollOptionImageUpload(pollIdx, optIdx, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-2 pt-3 md:pt-4">
                          <span className="text-[11px] font-bold text-gray-600 tabular-nums whitespace-nowrap">
                            {totalOptVotes}v
                          </span>
                          {poll.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                setPolls((prev) =>
                                  prev.map((p, idx) =>
                                    idx === pollIdx
                                      ? {
                                          ...p,
                                          options: p.options.filter((_, i) => i !== optIdx),
                                        }
                                      : p
                                  )
                                );
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                              title="Remove Choice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {!pollsLoaded ? (
          <div className="p-8 flex justify-center bg-white rounded-2xl border border-gray-200">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6A00]" />
          </div>
        ) : polls.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
            <p className="text-gray-700 font-semibold text-sm">
              No polls added yet. Only polls created and saved here will appear on the website.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPolls([
                    {
                      id: `poll-${Date.now()}`,
                      question: '',
                      category: 'Vuka Mwaka Awards 2026',
                      subtitle: '',
                      status: 'live',
                      closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                      is_active: true,
                      options: [
                        { id: `opt-${Date.now()}-1`, title: '', subtitle: '', image_url: '' },
                        { id: `opt-${Date.now()}-2`, title: '', subtitle: '', image_url: '' },
                      ],
                    },
                  ])
                }
                className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#e65c00] text-white text-xs font-bold cursor-pointer"
              >
                + Create First Poll
              </button>
              <button
                type="button"
                onClick={() => setPolls(DEFAULT_CULTURE_POLLS)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Load Starter Templates
              </button>
            </div>
          </div>
        ) : null}
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
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black font-['Poppins'] uppercase tracking-tight text-gray-900 mb-2">
          Homepage Content
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">Manage dynamic sections on the main landing page.</p>
      </div>

      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span className="font-bold text-sm sm:text-base">Content saved successfully!</span>
        </motion.div>
      )}

      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center justify-between gap-3 border border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="font-semibold text-sm">{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('stats')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm whitespace-nowrap cursor-pointer ${activeTab === 'stats' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Stats Counter</button>
        <button onClick={() => setActiveTab('features')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm whitespace-nowrap cursor-pointer ${activeTab === 'features' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Community Polls</button>
        <button onClick={() => setActiveTab('why')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm whitespace-nowrap cursor-pointer ${activeTab === 'why' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Why Choose Us</button>
        <button onClick={() => setActiveTab('experiences')} className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm whitespace-nowrap cursor-pointer ${activeTab === 'experiences' ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]' : 'text-gray-500'}`}>Our Experiences</button>
      </div>

      <div className="max-w-5xl">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'features' && renderFeatures()}
        {activeTab === 'why' && renderWhy()}
        {activeTab === 'experiences' && renderExperiences()}
      </div>
    </div>
  );
}
