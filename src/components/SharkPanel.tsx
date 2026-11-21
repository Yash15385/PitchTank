'use client';

import React from 'react';
import { SharkResponse } from '@/types/pitch';
import { SharkCard } from './SharkCard';
import { Users, CheckCircle2, XCircle } from 'lucide-react';

interface SharkPanelProps {
  sharks: SharkResponse[];
  round: number;
}

export const SharkPanel: React.FC<SharkPanelProps> = ({ sharks, round }) => {
  const inCount = sharks.filter((s) => s.status === 'IN').length;
  const outCount = sharks.filter((s) => s.status === 'OUT').length;
  const hasDeal = inCount > 0;

  return (
    <section className="w-full">
      {/* Panel Ticker / Scoreboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 md:p-4 bg-[#231F20] text-[#F5F0E6] rounded-xl border-3 border-[#231F20] shadow-[4px_4px_0px_#1F2937] mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D9534F] flex items-center justify-center border-2 border-[#FAF7F0] shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-lg md:text-xl tracking-wide uppercase text-white">
                5-SHARK PANEL
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F0] text-[#231F20] font-bold">
                ROUND {round}
              </span>
            </div>
            <p className="text-xs text-[#A8A29E] font-sans">
              All 5 sharks evaluated your pitch simultaneously in real-time
            </p>
          </div>
        </div>

        {/* Score tally pills */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1F332A] border border-[#2E7D32]">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span className="font-mono text-xs font-bold text-[#86EFAC]">
              {inCount} IN
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#3B1214] border border-[#D9534F]">
            <XCircle className="w-4 h-4 text-[#F87171]" />
            <span className="font-mono text-xs font-bold text-[#FCA5A5]">
              {outCount} OUT
            </span>
          </div>
        </div>
      </div>

      {/* 5-Shark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {sharks.map((shark, idx) => (
          <SharkCard key={shark.shark} shark={shark} index={idx} />
        ))}
      </div>

      {/* Deal Alert Banner */}
      {hasDeal && (
        <div className="mt-5 p-4 rounded-xl bg-[#E8F5E9] border-3 border-[#2E7D32] shadow-[4px_4px_0px_#1B4332] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h4 className="font-serif font-bold text-base md:text-lg text-[#1B4332]">
                DEAL ON THE TABLE! ({inCount} {inCount === 1 ? 'Shark' : 'Sharks'} IN)
              </h4>
              <p className="text-xs text-[#2D6A4F] font-sans">
                Review your offers below or continue negotiating for better syndicate terms.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
