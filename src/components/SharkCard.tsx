'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SharkResponse } from '@/types/pitch';
import { SHARK_PROFILES } from '@/lib/sharkArchetypes';
import { GeometricSharkAvatar } from './GeometricSharkAvatar';
import { sound } from '@/lib/sounds';
import { AlertCircle, HelpCircle, TrendingUp, CheckCircle, Flame } from 'lucide-react';

interface SharkCardProps {
  shark: SharkResponse;
  index: number;
}

export const SharkCard: React.FC<SharkCardProps> = ({ shark, index }) => {
  const profile = SHARK_PROFILES[shark.shark];
  const isOut = shark.status === 'OUT';
  const isIn = shark.status === 'IN';

  useEffect(() => {
    if (isOut) {
      const timer = setTimeout(() => {
        sound.playStampSound();
      }, index * 200 + 100);
      return () => clearTimeout(timer);
    } else if (isIn) {
      const timer = setTimeout(() => {
        sound.playDealSound();
      }, index * 200 + 100);
      return () => clearTimeout(timer);
    }
  }, [isOut, isIn, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1 }}
      className={`relative rounded-xl border-3 border-[#231F20] p-4 md:p-5 transition-all duration-200 overflow-hidden ${
        isIn
          ? 'bg-[#FAFDF6] shadow-[5px_5px_0px_#1B4332]'
          : isOut
          ? 'bg-[#FAF7F0] shadow-[5px_5px_0px_#231F20]'
          : 'bg-[#FDFBF7] shadow-[4px_4px_0px_#78716C]'
      }`}
    >
      {/* Paper texture subtle stitched edge */}
      <div className="absolute inset-1.5 border border-dashed border-[#D4C3A3] rounded-lg pointer-events-none" />

      {/* Top Bar: Shark Badge & Category */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <span
          className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#231F20] shadow-[1px_1px_0px_#231F20]"
          style={{ backgroundColor: profile.accentColor, color: '#18181B' }}
        >
          {profile.badge}
        </span>
        <span className="text-[11px] font-mono text-[#57534E] font-medium tracking-tight">
          SEAT 0{index + 1}
        </span>
      </div>

      {/* Shark Header: Avatar + Identity */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className="relative shrink-0">
          <GeometricSharkAvatar
            type={shark.shark}
            size={76}
            isOut={isOut}
            isIn={isIn}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif font-black text-base md:text-lg text-[#1F2937] leading-tight truncate">
            {profile.name}
          </h3>
          <p className="text-xs text-[#6B7280] font-sans font-medium line-clamp-1">
            {profile.role}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-mono text-[#78716C] italic line-clamp-1">
              &ldquo;{profile.tagline}&rdquo;
            </span>
          </div>
        </div>
      </div>

      {/* Shark Quote Callout (Typewriter style on textured tape) */}
      <div className="relative z-10 my-3 p-3 bg-[#EFE9DC] border-l-4 border-[#231F20] rounded-r-md text-xs font-mono text-[#292524] leading-relaxed shadow-inner">
        <span className="font-bold text-[#832623] mr-1">VERDICT:</span>
        &ldquo;{shark.harshQuote}&rdquo;
      </div>

      {/* Sharp Question Block */}
      <div className="relative z-10 mb-3 p-2.5 bg-[#FFFBEB] rounded-lg border border-[#FDE68A] shadow-[2px_2px_0px_#F59E0B]">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono font-bold text-amber-800 tracking-wide uppercase">
              SHARP QUESTION
            </p>
            <p className="text-xs font-serif italic text-[#451A03] font-semibold mt-0.5">
              {shark.sharpQuestion}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Economics Breakdown (Only if available / Numbers Shark) */}
      {shark.unitEconomics && (
        <div className="relative z-10 mb-3 p-2.5 bg-[#1F332A] rounded-lg border-2 border-[#14231C] text-[#E8F5E9] shadow-[2px_2px_0px_#231F20]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#A7F3D0] mb-2 pb-1 border-b border-[#3D5F50]">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> UNIT ECONOMICS AUDIT
            </span>
            <span>{shark.unitEconomics.unitLabel || 'Per Unit'}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="bg-[#14231C] p-1.5 rounded border border-[#3D5F50]">
              <span className="block text-[9px] text-[#9CA3AF] uppercase">Sell</span>
              <span className="text-xs font-bold text-white">
                {shark.unitEconomics.currency || '₹'}{shark.unitEconomics.sell}
              </span>
            </div>
            <div className="bg-[#14231C] p-1.5 rounded border border-[#3D5F50]">
              <span className="block text-[9px] text-[#F87171] uppercase">Cost</span>
              <span className="text-xs font-bold text-[#FCA5A5]">
                {shark.unitEconomics.currency || '₹'}{shark.unitEconomics.cost}
              </span>
            </div>
            <div className="bg-[#14231C] p-1.5 rounded border border-[#3D5F50]">
              <span className="block text-[9px] text-[#34D399] uppercase">Profit</span>
              <span className="text-xs font-bold text-[#6EE7B7]">
                {shark.unitEconomics.currency || '₹'}{shark.unitEconomics.profit}
              </span>
            </div>
          </div>
          {shark.unitEconomics.sell > 0 && (
            <div className="mt-2 text-[10px] font-mono flex items-center justify-between text-[#D1FAE5]">
              <span>Gross Margin:</span>
              <span className="font-bold text-amber-300">
                {Math.round(((shark.unitEconomics.sell - shark.unitEconomics.cost) / shark.unitEconomics.sell) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fix Demand Requirement */}
      <div className="relative z-10 p-2.5 bg-[#F5EBE1] rounded-lg border border-[#D5C2AF]">
        <div className="flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#881337] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono font-bold text-[#881337] tracking-wider uppercase block">
              REQUIRED FIX TO INVEST:
            </span>
            <p className="text-xs font-sans text-[#3F3F46] font-medium mt-0.5">
              {shark.fixItem}
            </p>
          </div>
        </div>
      </div>

      {/* Offer terms if IN */}
      {isIn && shark.offerDetails && (
        <div className="relative z-10 mt-3 p-2 bg-emerald-50 rounded border border-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="text-xs font-sans">
            <span className="font-bold text-emerald-900">Term Sheet Offer: </span>
            <span className="text-emerald-800 font-medium">{shark.offerDetails}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FRAMER MOTION "OUT" PLACARD RUBBER STAMP SLAM ANIMATION        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isOut && (
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -25, y: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: -7, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 14,
              stiffness: 280,
              delay: index * 0.15,
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="bg-[#D9534F]/95 text-[#FFF9F9] border-4 border-dashed border-[#FFF9F9] rounded-lg px-6 py-2.5 shadow-[0px_8px_20px_rgba(217,83,79,0.5)] transform">
              <div className="border-2 border-solid border-[#FFF9F9] px-4 py-1 flex flex-col items-center">
                <span className="font-serif font-black text-3xl md:text-4xl tracking-widest uppercase drop-shadow-[2px_2px_0px_#781816]">
                  OUT
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#FFEAEA] uppercase font-bold">
                  OFFER REJECTED
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* FRAMER MOTION "I'M IN" PLACARD CELEBRATION ANIMATION          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isIn && (
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: 25, y: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: 6, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 14,
              stiffness: 280,
              delay: index * 0.15,
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="bg-[#1E6B47]/95 text-[#FFF9F9] border-4 border-solid border-[#FAF7F0] rounded-lg px-6 py-2.5 shadow-[0px_8px_20px_rgba(30,107,71,0.5)] transform">
              <div className="border-2 border-dashed border-[#FAF7F0] px-4 py-1 flex flex-col items-center">
                <span className="font-serif font-black text-2xl md:text-3xl tracking-widest uppercase flex items-center gap-1.5 drop-shadow-[2px_2px_0px_#0C3822]">
                  <Flame className="w-6 h-6 text-yellow-300" /> I&apos;M IN!
                </span>
                <span className="text-[9px] font-mono tracking-widest text-emerald-200 uppercase font-bold">
                  DEAL ON THE TABLE
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
