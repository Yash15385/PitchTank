'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SharkResponse } from '@/types/pitch';
import { SHARK_PROFILES } from '@/lib/sharkArchetypes';
import { GeometricSharkAvatar } from './GeometricSharkAvatar';
import { CheckCheck, Share2, Sparkles, Award } from 'lucide-react';
import { sound } from '@/lib/sounds';

interface TermSheetReceiptProps {
  startupName: string;
  askAmount: string;
  askEquity: string;
  sharks: SharkResponse[];
  onNewPitch: () => void;
}

export const TermSheetReceipt: React.FC<TermSheetReceiptProps> = ({
  startupName,
  askAmount,
  askEquity,
  sharks,
  onNewPitch,
}) => {
  const inSharks = sharks.filter((s) => s.status === 'IN');
  if (inSharks.length === 0) return null;

  const handleShare = async () => {
    sound.playClickSound();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${startupName} got a deal on PitchTank!`,
          text: `My startup ${startupName} just secured investment from ${inSharks.length} sharks on PitchTank!`,
          url: window.location.href,
        });
      } catch {
        // user dismissed
      }
    } else {
      navigator.clipboard.writeText(
        `My startup ${startupName} just closed a deal with ${inSharks.map(s => s.sharkName).join(' & ')} on PitchTank!`
      );
      alert('Deal announcement copied to clipboard!');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full my-8 flex flex-col items-center justify-center"
    >
      {/* Thermal Receipt Paper Card */}
      <div className="relative w-full max-w-lg bg-[#FAF7F0] border-4 border-[#231F20] rounded-2xl shadow-[10px_10px_0px_#231F20] overflow-hidden p-6 md:p-8">
        
        {/* Top Perforated Sawtooth Edge */}
        <div className="absolute top-0 left-0 right-0 h-3 flex justify-between overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#F5F0E6] transform rotate-45 -translate-y-2 border border-black/10"
            />
          ))}
        </div>

        {/* Receipt Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-dashed border-[#231F20]">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5 border border-emerald-300">
            <Sparkles className="w-3 h-3" /> OFFICIAL SYNDICATE TERM SHEET
          </div>
          <h2 className="font-serif font-black text-2xl md:text-3xl text-[#231F20] uppercase tracking-tight">
            PITCHTANK STUDIOS
          </h2>
          <p className="text-[11px] font-mono text-[#78716C] mt-0.5">
            TERMINAL 01 • BROADCAST EPISODE #2026-PT
          </p>
        </div>

        {/* Startup & Deal Summary */}
        <div className="font-mono text-xs space-y-2 pb-4 mb-4 border-b border-dashed border-stone-300">
          <div className="flex justify-between items-center">
            <span className="text-[#78716C] uppercase">STARTUP:</span>
            <span className="font-bold text-[#1F2937] text-sm">{startupName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#78716C] uppercase">ORIGINAL ASK:</span>
            <span className="font-semibold text-[#1F2937]">{askAmount} for {askEquity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#78716C] uppercase">SYNDICATE PARTICIPATION:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {inSharks.length} SHARK{inSharks.length > 1 ? 'S' : ''} IN
            </span>
          </div>
        </div>

        {/* Participating Sharks Breakdown */}
        <div className="space-y-3 mb-6">
          <span className="block text-[11px] font-mono font-bold text-[#231F20] uppercase tracking-wider">
            COMMITTED INVESTORS:
          </span>
          {inSharks.map((s) => {
            const profile = SHARK_PROFILES[s.shark];
            return (
              <div
                key={s.shark}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-[#231F20] shadow-[2px_2px_0px_#231F20]"
              >
                <GeometricSharkAvatar type={s.shark} size={48} isIn={true} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-black text-xs md:text-sm text-[#1F2937] truncate">
                      {profile.name}
                    </h4>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      I&apos;M IN
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#059669] font-semibold mt-0.5">
                    {s.offerDetails || `${askAmount} syndicate commitment`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rubber Stamp: DEAL CLOSED */}
        <div className="relative py-4 flex items-center justify-center my-2 pointer-events-none">
          <div className="transform -rotate-6 px-6 py-2 border-4 border-dashed border-[#1E6B47] rounded-xl bg-emerald-50/90 text-[#1E6B47] shadow-lg">
            <span className="font-serif font-black text-2xl md:text-3xl tracking-widest uppercase flex items-center gap-2">
              <Award className="w-7 h-7" /> DEAL CLOSED!
            </span>
          </div>
        </div>

        {/* Barcode & Perforated Bottom */}
        <div className="pt-4 border-t-2 border-dashed border-[#231F20] flex flex-col items-center">
          {/* Barcode SVG */}
          <div className="w-full flex justify-center py-2">
            <svg viewBox="0 0 200 40" className="w-48 h-10">
              <rect x="0" y="0" width="4" height="40" fill="#231F20" />
              <rect x="6" y="0" width="2" height="40" fill="#231F20" />
              <rect x="12" y="0" width="6" height="40" fill="#231F20" />
              <rect x="22" y="0" width="2" height="40" fill="#231F20" />
              <rect x="28" y="0" width="8" height="40" fill="#231F20" />
              <rect x="40" y="0" width="4" height="40" fill="#231F20" />
              <rect x="48" y="0" width="2" height="40" fill="#231F20" />
              <rect x="54" y="0" width="6" height="40" fill="#231F20" />
              <rect x="64" y="0" width="4" height="40" fill="#231F20" />
              <rect x="72" y="0" width="10" height="40" fill="#231F20" />
              <rect x="86" y="0" width="2" height="40" fill="#231F20" />
              <rect x="92" y="0" width="6" height="40" fill="#231F20" />
              <rect x="102" y="0" width="4" height="40" fill="#231F20" />
              <rect x="110" y="0" width="8" height="40" fill="#231F20" />
              <rect x="122" y="0" width="2" height="40" fill="#231F20" />
              <rect x="128" y="0" width="6" height="40" fill="#231F20" />
              <rect x="138" y="0" width="4" height="40" fill="#231F20" />
              <rect x="146" y="0" width="8" height="40" fill="#231F20" />
              <rect x="158" y="0" width="2" height="40" fill="#231F20" />
              <rect x="164" y="0" width="6" height="40" fill="#231F20" />
              <rect x="174" y="0" width="4" height="40" fill="#231F20" />
              <rect x="182" y="0" width="10" height="40" fill="#231F20" />
              <rect x="196" y="0" width="4" height="40" fill="#231F20" />
            </svg>
          </div>
          <span className="font-mono text-[10px] text-[#78716C] tracking-widest">
            * 9 8 3 4 5 7 2 0 1 6 *
          </span>
        </div>

        {/* Interactive Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#231F20] bg-white hover:bg-stone-100 text-[#1F2937] font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[2px_2px_0px_#231F20] cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-700" /> Share Deal Victory
          </button>
          <button
            type="button"
            onClick={onNewPitch}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#231F20] bg-[#2E4A3E] hover:bg-[#253D33] text-white font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_#231F20] cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Pitch Another Venture
          </button>
        </div>
      </div>
    </motion.section>
  );
};
