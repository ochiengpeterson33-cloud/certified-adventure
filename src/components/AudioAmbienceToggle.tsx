import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export const AudioAmbienceToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startAmbience = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Create pink/brown noise for mountain wind & crackling campfire
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter formula
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // boost level
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter for soft breeze sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;

      // LFO for slow wind volume swell
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15; // 0.15 Hz slow swell
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 80;
      lfo.connect(filter.frequency);
      lfo.start();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 2); // Soft volume

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      whiteNoise.start();

      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = masterGain;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopAmbience = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);
      setTimeout(() => {
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
        setIsPlaying(false);
      }, 900);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAmbience();
    } else {
      startAmbience();
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleSound}
        className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-xl border ${
          isPlaying
            ? 'bg-[#E67A3A]/20 border-[#E67A3A] text-[#F4E8D2] shadow-[#E67A3A]/30'
            : 'bg-[#08121B]/80 border-[#F4E8D2]/20 text-[#F4E8D2]/80 hover:border-[#E67A3A]/60 hover:text-white'
        }`}
        title="Toggle Ambient Savannah Breeze & Campfire Sound"
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E67A3A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E67A3A]"></span>
            </span>
            <Volume2 className="w-4 h-4 text-[#E67A3A] animate-pulse" />
            <span className="hidden sm:inline">Savannah Atmosphere ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 group-hover:text-[#E67A3A] transition-colors" />
            <span className="hidden sm:inline">Savannah Audio</span>
            <Sparkles className="w-3 h-3 text-[#E67A3A]/70" />
          </>
        )}
      </button>
    </div>
  );
};
