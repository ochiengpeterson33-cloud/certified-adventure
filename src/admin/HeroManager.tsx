import React, { useState } from 'react';
import { HeroImageManager } from './HeroImageManager';
import { HeroVideoManager } from './HeroVideoManager';
import { Image as ImageIcon, Video } from 'lucide-react';

export function HeroManager() {
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hero Section Manager</h1>
        <p className="text-gray-500 mt-1">Manage hero videos and legacy image slides.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('video')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'video' 
              ? 'border-[#E67A3A] text-[#E67A3A]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Video size={18} />
          Video Backgrounds
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'image' 
              ? 'border-[#E67A3A] text-[#E67A3A]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ImageIcon size={18} />
          Image Slides
        </button>
      </div>

      {activeTab === 'video' && <HeroVideoManager />}
      {activeTab === 'image' && <HeroImageManager />}
    </div>
  );
}
