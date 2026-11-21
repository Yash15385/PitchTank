'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Key, Sparkles, Radio } from 'lucide-react';
import { sound } from '@/lib/sounds';

interface MarqueeHeaderProps {
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
}

export const MarqueeHeader: React.FC<MarqueeHeaderProps> = ({
  onOpenApiKeyModal,
  hasCustomKey,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [bulbToggle, setBulbToggle] = useState(false);

  useEffect(() => {
    setIsMuted(sound.isMuted());
    const interval = setInterval(() => {
      setBulbToggle((prev) => !prev);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="w-full relative select-none">
      {/* Top Utility Ribbon */}
      <div className="flex items-center justify-between pb-2 mb-2 px-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#D9534F] text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE ON AIR
          </span>
          <span className="text-[#57534E] hidden sm:inline text-[11px]">
            STUDIO BROADCAST • BATCH 2026
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#231F20] bg-[#FAF7F0] hover:bg-stone-200 text-[#292524] shadow-[1px_1px_0px_#231F20] text-[11px] font-bold cursor-pointer"
            title={isMuted ? 'Unmute Audio Effects' : 'Mute Audio Effects'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">SFX ON</span>
              </>
            )}
          </button>

          {/* API Key Config */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#231F20] text-[11px] font-bold shadow-[1px_1px_0px_#231F20] cursor-pointer transition-colors ${
              hasCustomKey
                ? 'bg-amber-100 text-amber-900 border-amber-800'
                : 'bg-[#FAF7F0] hover:bg-stone-200 text-[#292524]'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#2E4A3E]" />
            <span className="hidden sm:inline">API KEY</span>
            {hasCustomKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Main Marquee Board Box */}
      <div className="relative p-2.5 sm:p-4 rounded-2xl bg-[#231F20] border-4 border-[#141213] shadow-[8px_8px_0px_#2E4A3E]">
        
        {/* Outer Bulb Chaser Ring */}
        <div className="relative p-3 sm:p-5 rounded-xl bg-[#2E4A3E] border-2 border-[#1E332A] overflow-hidden">
          
          {/* Top Marquee Bulbs */}
          <div className="flex justify-between items-center px-2 mb-2 sm:mb-3">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-black/40 transition-colors duration-300 ${
                  (i % 2 === 0 ? bulbToggle : !bulbToggle)
                    ? 'bg-[#FDE047] shadow-[0_0_8px_#FDE047]'
                    : 'bg-[#78716C] opacity-50'
                }`}
              />
            ))}
          </div>

          {/* Marquee Center Signboard */}
          <div className="bg-[#FAF7F0] rounded-lg border-3 border-[#231F20] py-4 px-3 sm:py-6 sm:px-6 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative">
            {/* Corner Decorative Brackets */}
            <span className="absolute top-1 left-2 font-mono text-xs text-[#D9534F] font-bold">★</span>
            <span className="absolute top-1 right-2 font-mono text-xs text-[#D9534F] font-bold">★</span>
            <span className="absolute bottom-1 left-2 font-mono text-xs text-[#D9534F] font-bold">★</span>
            <span className="absolute bottom-1 right-2 font-mono text-xs text-[#D9534F] font-bold">★</span>

            <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-0.5 rounded-full bg-[#D9534F]/10 border border-[#D9534F]/30 text-[#D9534F] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> THE TACTILE SHARK TANK SIMULATOR
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-[#231F20] tracking-tight uppercase leading-none mt-1 drop-shadow-[2px_2px_0px_#D4C3A3]">
              PITCH NIGHT
            </h1>

            <p className="mt-2 text-xs sm:text-sm font-serif italic text-[#57534E] max-w-md mx-auto">
              Present your venture to five ruthless AI shark archetypes. Survive their grilling or face the stamp!
            </p>
          </div>

          {/* Bottom Marquee Bulbs */}
          <div className="flex justify-between items-center px-2 mt-2 sm:mt-3">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-black/40 transition-colors duration-300 ${
                  (i % 2 === 1 ? bulbToggle : !bulbToggle)
                    ? 'bg-[#FDE047] shadow-[0_0_8px_#FDE047]'
                    : 'bg-[#78716C] opacity-50'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </header>
  );
};
