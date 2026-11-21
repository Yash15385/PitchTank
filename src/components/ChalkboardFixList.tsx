'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SharkResponse, SharkFixRebuttal } from '@/types/pitch';
import { SHARK_PROFILES } from '@/lib/sharkArchetypes';
import { sound } from '@/lib/sounds';
import { Check, Edit3, Pin, Sparkles } from 'lucide-react';

interface ChalkboardFixListProps {
  sharks: SharkResponse[];
  rebuttals: SharkFixRebuttal[];
  onToggleCheck: (sharkType: string) => void;
  onUpdateRebuttal: (sharkType: string, text: string) => void;
}

const STICKY_COLORS = [
  'bg-[#FEF9C3] text-[#713F12] border-[#FDE047]', // Sticky Yellow
  'bg-[#FCE7F3] text-[#831843] border-[#F472B6]', // Sticky Pink
  'bg-[#E0F2FE] text-[#075985] border-[#38BDF8]', // Sticky Sky
  'bg-[#DCFCE7] text-[#14532D] border-[#4ADE80]', // Sticky Mint
  'bg-[#FFEDD5] text-[#7C2D12] border-[#FB923C]', // Sticky Orange
];

export const ChalkboardFixList: React.FC<ChalkboardFixListProps> = ({
  sharks,
  rebuttals,
  onToggleCheck,
  onUpdateRebuttal,
}) => {
  const checkedCount = rebuttals.filter((r) => r.checked).length;
  const totalCount = sharks.length;

  return (
    <section className="w-full relative my-8">
      {/* Wooden Frame Exterior */}
      <div className="p-3 md:p-5 rounded-2xl bg-[#6B4423] border-4 border-[#3D2514] shadow-[8px_8px_0px_#231F20]">
        {/* Chalkboard Slate Interior */}
        <div className="relative p-4 md:p-6 rounded-xl bg-[#2E4A3E] border-2 border-dashed border-[#52796F] text-[#FAF7F0] overflow-hidden">
          
          {/* Subtle Chalk Dust Effect & Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/30 pointer-events-none" />

          {/* Chalkboard Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-6 border-b-2 border-dashed border-[#52796F]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="font-serif font-black text-xl md:text-2xl tracking-wide uppercase text-white drop-shadow-[1px_1px_0px_#000]">
                  THE CHALKBOARD FIX LIST
                </h3>
              </div>
              <p className="text-xs text-[#A3B899] font-mono mt-1">
                Pin each shark&apos;s demand to the board. Check off fixes and prepare your counter-strategy for Round 2.
              </p>
            </div>

            {/* Chalk Progress Counter */}
            <div className="flex items-center gap-3 bg-[#1F332A] px-4 py-2 rounded-lg border border-[#52796F] self-start md:self-auto">
              <span className="font-mono text-xs text-[#A3B899] uppercase tracking-wider">
                Progress:
              </span>
              <span className="font-mono font-bold text-sm text-[#FDE047]">
                {checkedCount} / {totalCount} Addressed
              </span>
              <div className="w-24 h-2.5 bg-[#14231C] rounded-full overflow-hidden border border-[#52796F]">
                <div
                  className="h-full bg-[#4ADE80] transition-all duration-300"
                  style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sticky Notes Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sharks.map((shark, idx) => {
              const profile = SHARK_PROFILES[shark.shark];
              const rebuttal = rebuttals.find((r) => r.shark === shark.shark);
              const isChecked = rebuttal?.checked || false;
              const stickyColorClass = STICKY_COLORS[idx % STICKY_COLORS.length];

              return (
                <motion.div
                  key={shark.shark}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className={`relative p-4 md:p-5 rounded-lg border-2 shadow-[4px_4px_0px_#1B332A] transition-transform duration-200 ${stickyColorClass} ${
                    idx % 2 === 0 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'
                  }`}
                >
                  {/* Washi Tape Strip at top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FAF7F0]/80 border-t border-b border-[#D4C3A3] shadow-sm transform -rotate-1 pointer-events-none" />

                  {/* Pin Icon */}
                  <div className="absolute -top-1 right-2 text-stone-700/60 pointer-events-none">
                    <Pin className="w-4 h-4 fill-current transform rotate-45" />
                  </div>

                  {/* Top: Shark Name & Category */}
                  <div className="flex items-center justify-between gap-1 mb-2 pt-1 border-b border-black/10 pb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      {profile.badge}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      {profile.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Checkbox & Fix Requirement */}
                  <div className="flex items-start gap-2.5 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playChalkSound();
                        onToggleCheck(shark.shark);
                      }}
                      className={`shrink-0 w-6 h-6 rounded border-2 border-[#231F20] flex items-center justify-center transition-colors cursor-pointer shadow-[1px_1px_0px_#231F20] ${
                        isChecked ? 'bg-[#2E7D32] text-white' : 'bg-white hover:bg-stone-100'
                      }`}
                      aria-label={`Toggle fix for ${profile.name}`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-xs font-serif font-bold leading-snug transition-all ${
                          isChecked ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {shark.fixItem}
                      </p>
                    </div>
                  </div>

                  {/* Rebuttal Textarea (founder's response for round 2) */}
                  <div className="mt-3 pt-2.5 border-t border-black/10">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1 opacity-80">
                        <Edit3 className="w-3 h-3" /> Rebuttal Strategy:
                      </label>
                      {isChecked && (
                        <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                          READY FOR RE-PITCH
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={rebuttal?.rebuttal || ''}
                      onChange={(e) => onUpdateRebuttal(shark.shark, e.target.value)}
                      placeholder={`Explain how you solve ${profile.name.split(' ')[0]}'s demand...`}
                      className="w-full text-xs font-mono p-2 rounded border border-black/20 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black placeholder:text-black/40 resize-none"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Chalk Hint */}
          <div className="relative z-10 mt-6 pt-3 border-t border-dashed border-[#52796F] text-center">
            <p className="text-xs font-mono text-[#A3B899] italic flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Pro Tip: Check at least 2-3 fixes with solid rebuttals to trigger an investment flip in Round 2!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
