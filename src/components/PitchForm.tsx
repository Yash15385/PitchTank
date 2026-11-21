'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SAMPLE_PITCHES } from '@/lib/sharkArchetypes';
import { sound } from '@/lib/sounds';
import { Send, Sparkles, Building2, Flame, DollarSign, Percent } from 'lucide-react';

interface PitchFormProps {
  onSubmitPitch: (data: {
    startupName: string;
    oneLiner: string;
    askAmount: string;
    askEquity: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const PitchForm: React.FC<PitchFormProps> = ({ onSubmitPitch, isLoading }) => {
  const [startupName, setStartupName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [askAmount, setAskAmount] = useState('₹50 Lakh');
  const [askEquity, setAskEquity] = useState('5%');

  const handleSelectSample = (sample: (typeof SAMPLE_PITCHES)[0]) => {
    sound.playClickSound();
    setStartupName(sample.startupName);
    setOneLiner(sample.oneLiner);
    setAskAmount(sample.askAmount);
    setAskEquity(sample.askEquity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName.trim() || !oneLiner.trim()) return;
    sound.playClickSound();
    await onSubmitPitch({
      startupName: startupName.trim(),
      oneLiner: oneLiner.trim(),
      askAmount: askAmount.trim(),
      askEquity: askEquity.trim(),
    });
  };

  return (
    <div className="w-full relative my-6">
      {/* Manila Folder / Legal Pad Container */}
      <div className="p-4 sm:p-7 rounded-2xl bg-[#FAF7F0] border-3 border-[#231F20] shadow-[7px_7px_0px_#231F20] relative overflow-hidden">
        
        {/* Top Paper Clip & Folder Tab */}
        <div className="absolute top-0 right-8 -translate-y-1/2 w-16 h-8 bg-[#D4C3A3] border-2 border-[#231F20] rounded-b-md shadow-sm pointer-events-none flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-[#231F20]">DOSSIER</span>
        </div>

        {/* Paper Header / Stamp */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b-2 border-dashed border-[#D4C3A3] gap-2">
          <div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-[#231F20] tracking-tight uppercase flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D9534F]" />
              FOUNDER PITCH BRIEF
            </h2>
            <p className="text-xs text-[#78716C] font-mono mt-0.5">
              FORM 100-B • OFFICIAL ENTRY TO THE TANK
            </p>
          </div>

          <div className="transform sm:rotate-2 px-3 py-1 bg-[#D9534F]/10 border border-[#D9534F] text-[#D9534F] font-mono text-[10px] font-bold rounded uppercase tracking-wider">
            HIGH STAKES CONFIDENTIAL
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-5 p-3 rounded-lg bg-[#EFE9DC] border border-[#D4C3A3]">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-mono font-bold text-[#57534E]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>TRY A READY-MADE PITCH:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PITCHES.map((sample) => (
              <button
                key={sample.startupName}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-2.5 py-1 text-xs font-mono bg-white hover:bg-stone-100 rounded-md border border-[#231F20] shadow-[1px_1px_0px_#231F20] active:translate-x-[1px] active:translate-y-[1px] text-[#292524] transition-all cursor-pointer"
              >
                ⚡ {sample.startupName} ({sample.askAmount} for {sample.askEquity})
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Startup Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#292524] mb-1">
              Startup Name:
            </label>
            <input
              type="text"
              required
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g., KulladKarts, CleanCharge, ChaiBot"
              className="w-full text-sm font-sans font-semibold p-3 rounded-xl border-2 border-[#231F20] bg-white shadow-[2px_2px_0px_#231F20] focus:outline-none focus:ring-2 focus:ring-[#2E4A3E] placeholder:text-stone-400"
            />
          </div>

          {/* One-Line Pitch */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#292524]">
                One-Line Pitch (The Hook):
              </label>
              <span className="text-[10px] font-mono text-[#78716C]">
                {oneLiner.length} / 280 chars
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={280}
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="What do you build, for whom, and why is it an unstoppable rocket ship? (e.g., Automated artisanal clay-cup chai dispensing kiosks at Tier-1 railway stations brewing fresh tea in 30 seconds)"
              className="w-full text-sm font-sans font-normal p-3 rounded-xl border-2 border-[#231F20] bg-white shadow-[2px_2px_0px_#231F20] focus:outline-none focus:ring-2 focus:ring-[#2E4A3E] placeholder:text-stone-400 resize-none leading-relaxed"
            />
          </div>

          {/* The Ask: Amount & Equity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#292524] mb-1">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Capital Ask Amount:
                </span>
              </label>
              <input
                type="text"
                required
                value={askAmount}
                onChange={(e) => setAskAmount(e.target.value)}
                placeholder="e.g., ₹50 Lakh, ₹1 Crore, $250,000"
                className="w-full text-sm font-mono font-bold p-3 rounded-xl border-2 border-[#231F20] bg-white shadow-[2px_2px_0px_#231F20] focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]"
              />
              <div className="mt-1.5 flex gap-1.5">
                {['₹25 Lakh', '₹50 Lakh', '₹1 Crore'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAskAmount(amt)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#292524] mb-1">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-700" /> Equity Offered:
                </span>
              </label>
              <input
                type="text"
                required
                value={askEquity}
                onChange={(e) => setAskEquity(e.target.value)}
                placeholder="e.g., 5%, 8%, 10%"
                className="w-full text-sm font-mono font-bold p-3 rounded-xl border-2 border-[#231F20] bg-white shadow-[2px_2px_0px_#231F20] focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]"
              />
              <div className="mt-1.5 flex gap-1.5">
                {['4%', '5%', '7.5%', '10%'].map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => setAskEquity(eq)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Submit Button */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || !startupName.trim() || !oneLiner.trim()}
              className={`w-full py-4 px-6 rounded-xl border-3 border-[#231F20] font-serif font-black text-lg md:text-xl tracking-wider uppercase text-white shadow-[5px_5px_0px_#231F20] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoading || !startupName.trim() || !oneLiner.trim()
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-[#2E4A3E] hover:bg-[#253D33] active:translate-x-[2px] active:translate-y-[2px]'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>THE SHARKS ARE SCRUTINIZING YOUR PITCH...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>STEP INTO THE TANK</span>
                  <Send className="w-5 h-5 ml-1" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};
