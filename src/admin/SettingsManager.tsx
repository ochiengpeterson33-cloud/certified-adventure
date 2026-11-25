import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import {
  Settings,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  Sliders,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { optimizeImageForUpload } from '../lib/imageOptimizer';
import {
  AuthPageThemeConfig,
  DEFAULT_AUTH_PAGE_THEME,
  invalidateServerCache,
  parseAuthPageThemeConfig,
} from '../hooks/useSupabaseData';

interface WebsiteSettings {
  id: string;
  site_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
}

const CONTRAST_PRESETS: { label: string; values: Omit<AuthPageThemeConfig, 'image_url'> }[] = [
  {
    label: 'Airy Light Glass',
    values: {
      glass_opacity: 16,
      glass_blur: 18,
      backdrop_dim: 18,
      image_contrast: 105,
      image_brightness: 102,
    },
  },
  {
    label: 'Balanced Frosted',
    values: {
      glass_opacity: 24,
      glass_blur: 20,
      backdrop_dim: 28,
      image_contrast: 105,
      image_brightness: 95,
    },
  },
  {
    label: 'Deep High Contrast',
    values: {
      glass_opacity: 52,
      glass_blur: 24,
      backdrop_dim: 45,
      image_contrast: 112,
      image_brightness: 82,
    },
  },
];

export function SettingsManager() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Login & Register Background + Contrast State
  const [authTheme, setAuthTheme] = useState<AuthPageThemeConfig>({ ...DEFAULT_AUTH_PAGE_THEME });
  const [isUploadingAuthBg, setIsUploadingAuthBg] = useState(false);
  const [isSavingAuthBg, setIsSavingAuthBg] = useState(false);
  const [authBgSaved, setAuthBgSaved] = useState(false);
  const [authBgError, setAuthBgError] = useState<string | null>(null);
  const [galleryPickerImages, setGalleryPickerImages] = useState<{ id: string; url: string; label: string }[]>([]);

  const { isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('website_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;

      const defaultSettings: WebsiteSettings = {
        id: '',
        site_name: 'Certified Adventures',
        contact_email: 'hello@certifiedadventures.com',
        contact_phone: '+254 700 000000',
        address: 'Nairobi, Kenya',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        youtube_url: '',
      };

      const currentSettings = data || defaultSettings;
      setSettings(currentSettings);
      return currentSettings;
    },
  });

  // Load current Login & Register background & contrast settings + quick-pick photos
  useEffect(() => {
    async function loadAuthBackground() {
      const [{ data: catRow }, { data: heroRows }, { data: galleryRows }] = await Promise.all([
        supabase
          .from('categories')
          .select('description')
          .eq('slug', 'auth-page-background')
          .maybeSingle(),
        supabase.from('hero_slides').select('id, image_url, title').limit(6),
        supabase.from('gallery').select('id, image_url, title').order('created_at', { ascending: false }).limit(6),
      ]);

      if (catRow?.description) {
        setAuthTheme(parseAuthPageThemeConfig(catRow.description));
      }

      const picks: { id: string; url: string; label: string }[] = [];
      (heroRows || []).forEach((h: any) => {
        if (h?.image_url) picks.push({ id: `hero-${h.id}`, url: h.image_url, label: h.title || 'Hero' });
      });
      (galleryRows || []).forEach((g: any) => {
        if (g?.image_url && !picks.some((p) => p.url === g.image_url)) {
          picks.push({ id: `gal-${g.id}`, url: g.image_url, label: g.title || 'Gallery' });
        }
      });
      setGalleryPickerImages(picks.slice(0, 8));
    }

    loadAuthBackground();
  }, []);

  const persistAuthTheme = async (nextTheme: AuthPageThemeConfig) => {
    setIsSavingAuthBg(true);
    setAuthBgSaved(false);
    setAuthBgError(null);
    try {
      const sanitized: AuthPageThemeConfig = {
        ...nextTheme,
        image_url: nextTheme.image_url.trim(),
      };

      const payload = {
        name: 'AUTH PAGE BACKGROUND',
        slug: 'auth-page-background',
        description: JSON.stringify({
          ...sanitized,
          updated_at: new Date().toISOString(),
        }),
      };

      const { data: existing, error: fetchErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'auth-page-background')
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      if (existing?.id) {
        const { error: updateErr } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', existing.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('categories').insert(payload);
        if (insertErr) throw insertErr;
      }

      setAuthTheme(sanitized);
      queryClient.setQueryData(['auth-page-background'], sanitized);
      queryClient.invalidateQueries({ queryKey: ['auth-page-background'] });
      await invalidateServerCache(['cms']);
      setAuthBgSaved(true);
      setTimeout(() => setAuthBgSaved(false), 3000);
    } catch (err: any) {
      console.error('Error saving auth background:', err);
      setAuthBgError(err?.message || 'Failed to save background & contrast settings.');
    } finally {
      setIsSavingAuthBg(false);
    }
  };

  const onDropAuthBg = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploadingAuthBg(true);
      setAuthBgError(null);
      setAuthBgSaved(false);
      try {
        const optimized = await optimizeImageForUpload(acceptedFiles[0]);
        const fileExt = optimized.name.split('.').pop() || 'webp';
        const fileName = `auth_bg_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('website-assets')
          .upload(fileName, optimized, {
            contentType: optimized.type || undefined,
          });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('website-assets').getPublicUrl(fileName);

        await persistAuthTheme({ ...authTheme, image_url: publicUrl });
      } catch (err: any) {
        console.error('Error uploading auth background:', err);
        setAuthBgError(err?.message || 'Failed to upload image. Please check the file and try again.');
      } finally {
        setIsUploadingAuthBg(false);
      }
    },
    [authTheme]
  );

  const authBgDropzone = useDropzone({
    onDrop: onDropAuthBg,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  } as any);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      if (settings.id) {
        const { error } = await supabase.from('website_settings').update(settings).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('website_settings').insert(settings).select().single();
        if (error) throw error;
        setSettings(data);
      }
      queryClient.invalidateQueries({ queryKey: ['website_settings'] });
      await invalidateServerCache(['cms']);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveError(err?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading settings.</div>;

  const previewDim = Math.max(0, Math.min(0.8, authTheme.backdrop_dim / 100));
  const previewGlass = Math.max(0, Math.min(0.85, authTheme.glass_opacity / 100));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure global website preferences, contact information, and Login/Register backdrop &amp; contrast.
        </p>
      </div>

      {/* Login & Register Background & Glassmorphism Contrast Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon size={20} className="text-[#E67A3A]" />
                Login &amp; Register Background &amp; Contrast
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload the backdrop photo and fine-tune glassmorphism brightness, blur, and contrast.
              </p>
            </div>
            {authBgSaved && (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5 shrink-0">
                <CheckCircle2 size={15} /> Saved &amp; Live
              </span>
            )}
          </div>

          {authBgError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{authBgError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Live Interactive Preview */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Live Split-Glass Preview
              </span>
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-gray-200 bg-[#08121B]">
                {authTheme.image_url ? (
                  <img
                    src={authTheme.image_url}
                    alt="Login and Register background preview"
                    style={{
                      filter: `contrast(${authTheme.image_contrast}%) brightness(${authTheme.image_brightness}%)`,
                    }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[radial-gradient(ellipse_90%_80%_at_25%_35%,rgba(230,122,58,0.22)_0%,rgba(41,73,47,0.2)_45%,#08121B_85%)]" />
                )}

                {/* Scrim Overlay */}
                <div
                  style={{
                    background: `linear-gradient(90deg, rgba(8,18,27,${Math.min(0.85, previewDim * 1.15).toFixed(2)}) 0%, rgba(8,18,27,${(previewDim * 0.65).toFixed(2)}) 52%, rgba(8,18,27,${(previewDim * 0.35).toFixed(2)}) 100%)`,
                  }}
                  className="absolute inset-0"
                />

                {/* Left Headline Sample */}
                <div className="absolute inset-y-0 left-0 w-1/2 p-4 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow">
                    Welcome Back
                  </p>
                  <p className="text-[10px] text-white/80 mt-1 leading-snug line-clamp-2">
                    Live contrast &amp; legibility preview
                  </p>
                </div>

                {/* Right Glassmorphism Sample */}
                <div
                  style={{
                    backgroundColor: `rgba(12, 20, 30, ${previewGlass.toFixed(2)})`,
                    backdropFilter: `blur(${authTheme.glass_blur}px)`,
                    WebkitBackdropFilter: `blur(${authTheme.glass_blur}px)`,
                  }}
                  className="absolute inset-y-0 right-0 w-1/2 border-l border-white/20 flex flex-col justify-center p-4 gap-2"
                >
                  <span className="text-xs font-semibold text-white">Sign In</span>
                  <div className="border-b border-white/45 pb-1 text-[10px] text-white/70">
                    Email
                  </div>
                  <div className="border-b border-white/45 pb-1 text-[10px] text-white/70">
                    Password
                  </div>
                  <div className="mt-1 inline-flex w-fit px-2.5 py-0.5 rounded-full border border-white/75 text-[9px] text-white">
                    Sign In &gt;
                  </div>
                </div>
              </div>

              {authTheme.image_url && (
                <button
                  type="button"
                  onClick={() => persistAuthTheme({ ...authTheme, image_url: '' })}
                  disabled={isSavingAuthBg || isUploadingAuthBg}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-50 pt-1"
                >
                  <Trash2 size={14} /> Remove Background Image
                </button>
              )}
            </div>

            {/* Upload Dropzone + Direct URL */}
            <div className="space-y-4">
              <div
                {...authBgDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  authBgDropzone.isDragActive
                    ? 'border-[#E67A3A] bg-orange-50'
                    : 'border-gray-300 hover:border-[#E67A3A] bg-gray-50/70'
                }`}
              >
                <input {...authBgDropzone.getInputProps()} />
                {isUploadingAuthBg ? (
                  <div className="flex flex-col items-center justify-center py-2 text-[#E67A3A]">
                    <Loader2 className="w-7 h-7 animate-spin mb-2" />
                    <span className="text-xs font-semibold">Optimizing &amp; uploading image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1 text-gray-600">
                    <Upload className="w-7 h-7 text-[#E67A3A] mb-2" />
                    <p className="text-sm font-semibold text-gray-800">
                      Click or drag &amp; drop an image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically optimized to WebP for fast loading on phones
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Or Paste Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={authTheme.image_url}
                    onChange={(e) => setAuthTheme({ ...authTheme, image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 min-w-0 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => persistAuthTheme(authTheme)}
                    disabled={isSavingAuthBg || isUploadingAuthBg}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#08121B] hover:bg-[#E67A3A] disabled:opacity-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {isSavingAuthBg ? 'Saving...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Glassmorphism & Image Contrast Controls */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sliders size={16} className="text-[#E67A3A]" />
                Glassmorphism &amp; Image Contrast Controls
              </h3>

              <div className="flex flex-wrap items-center gap-1.5">
                {CONTRAST_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setAuthTheme((prev) => ({ ...prev, ...preset.values }))}
                    className="px-2.5 py-1 rounded-md border border-gray-200 hover:border-[#E67A3A] bg-gray-50 hover:bg-orange-50 text-[11px] font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAuthTheme((prev) => ({
                      ...DEFAULT_AUTH_PAGE_THEME,
                      image_url: prev.image_url,
                    }))
                  }
                  className="px-2.5 py-1 rounded-md border border-gray-200 hover:border-gray-300 text-[11px] font-semibold text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/80 border border-gray-200/80 rounded-xl p-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Glass Darkness</span>
                  <span className="tabular-nums text-[#E67A3A]">{authTheme.glass_opacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={85}
                  value={authTheme.glass_opacity}
                  onChange={(e) =>
                    setAuthTheme((prev) => ({ ...prev, glass_opacity: Number(e.target.value) }))
                  }
                  className="w-full accent-[#E67A3A] cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Lower = lighter transparent glass
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Glass Blur</span>
                  <span className="tabular-nums text-[#E67A3A]">{authTheme.glass_blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={36}
                  value={authTheme.glass_blur}
                  onChange={(e) =>
                    setAuthTheme((prev) => ({ ...prev, glass_blur: Number(e.target.value) }))
                  }
                  className="w-full accent-[#E67A3A] cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Controls frost softness behind inputs
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Backdrop Dim Scrim</span>
                  <span className="tabular-nums text-[#E67A3A]">{authTheme.backdrop_dim}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={authTheme.backdrop_dim}
                  onChange={(e) =>
                    setAuthTheme((prev) => ({ ...prev, backdrop_dim: Number(e.target.value) }))
                  }
                  className="w-full accent-[#E67A3A] cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Darkens bright photos for text contrast
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Photo Contrast</span>
                  <span className="tabular-nums text-[#E67A3A]">{authTheme.image_contrast}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  value={authTheme.image_contrast}
                  onChange={(e) =>
                    setAuthTheme((prev) => ({ ...prev, image_contrast: Number(e.target.value) }))
                  }
                  className="w-full accent-[#E67A3A] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Photo Brightness</span>
                  <span className="tabular-nums text-[#E67A3A]">{authTheme.image_brightness}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={140}
                  value={authTheme.image_brightness}
                  onChange={(e) =>
                    setAuthTheme((prev) => ({ ...prev, image_brightness: Number(e.target.value) }))
                  }
                  className="w-full accent-[#E67A3A] cursor-pointer"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => persistAuthTheme(authTheme)}
                  disabled={isSavingAuthBg || isUploadingAuthBg}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Save size={15} />
                  <span>{isSavingAuthBg ? 'Saving Contrast...' : 'Save Contrast & Backdrop'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Pick from Existing Hero / Gallery Photos */}
          {galleryPickerImages.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <span className="block text-xs font-bold text-gray-700 mb-2">
                Quick Pick from Your Uploaded Hero &amp; Gallery Photos
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {galleryPickerImages.map((item) => {
                  const isSelected = authTheme.image_url === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => persistAuthTheme({ ...authTheme, image_url: item.url })}
                      disabled={isSavingAuthBg || isUploadingAuthBg}
                      title={item.label}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#E67A3A] ring-2 ring-[#E67A3A]/30'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Link to Explore Our Experiences Glassmorphism & Contrast */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#E67A3A] flex items-center justify-center shrink-0">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Explore Our Experiences — Glassmorphism &amp; Contrast
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Adjust frosted glass opacity, blur, contrast levels, and background media for the Experiences grid.
            </p>
          </div>
        </div>
        <Link
          to="/admin/homepage?tab=experiences"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#08121B] hover:bg-[#E67A3A] text-white text-xs font-bold transition-colors shrink-0"
        >
          <span>Level Experiences Contrast</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Existing Website Settings Form */}
      {settings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* General Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Settings size={20} className="text-[#E67A3A]" /> General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.contact_phone || ''}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Office Address</label>
                  <input
                    type="text"
                    value={settings.address || ''}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Social Media Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={settings.facebook_url || ''}
                    onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={settings.instagram_url || ''}
                    onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Twitter/X URL</label>
                  <input
                    type="text"
                    value={settings.twitter_url || ''}
                    onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={settings.youtube_url || ''}
                    onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
              {saveSuccess && (
                <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Saved Successfully
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
