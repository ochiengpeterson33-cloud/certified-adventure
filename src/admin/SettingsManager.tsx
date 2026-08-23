import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

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

export function SettingsManager() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('website_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      
      const defaultSettings: WebsiteSettings = {
        id: '',
        site_name: 'Certified Adventures',
        contact_email: 'hello@certifiedadventures.com',
        contact_phone: '+254 700 000000',
        address: 'Nairobi, Kenya',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        youtube_url: ''
      };
      
      const currentSettings = data || defaultSettings;
      setSettings(currentSettings);
      return currentSettings;
    }
  });

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      if (settings.id) {
        const { error } = await supabase.from('website_settings').update(settings).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('website_settings').insert(settings).select().single();
        if (error) throw error;
        setSettings(data);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading settings.</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col justify-between items-start mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
        <p className="text-gray-500 mt-1">Configure global website preferences and contact information.</p>
      </div>

      {settings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
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
                    onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                  <input 
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input 
                    type="text"
                    value={settings.contact_phone || ''}
                    onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Office Address</label>
                  <input 
                    type="text"
                    value={settings.address || ''}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Facebook URL</label>
                  <input 
                    type="text"
                    value={settings.facebook_url || ''}
                    onChange={(e) => setSettings({...settings, facebook_url: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Instagram URL</label>
                  <input 
                    type="text"
                    value={settings.instagram_url || ''}
                    onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Twitter/X URL</label>
                  <input 
                    type="text"
                    value={settings.twitter_url || ''}
                    onChange={(e) => setSettings({...settings, twitter_url: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL</label>
                  <input 
                    type="text"
                    value={settings.youtube_url || ''}
                    onChange={(e) => setSettings({...settings, youtube_url: e.target.value})}
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
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#E67A3A] hover:bg-[#c9662d] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
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
