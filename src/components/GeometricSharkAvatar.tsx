'use client';

import React from 'react';
import { SharkType } from '@/types/pitch';

interface GeometricSharkAvatarProps {
  type: SharkType;
  size?: number;
  className?: string;
  isOut?: boolean;
  isIn?: boolean;
}

export const GeometricSharkAvatar: React.FC<GeometricSharkAvatarProps> = ({
  type,
  size = 120,
  className = '',
  isOut = false,
  isIn = false,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Paper texture badge background */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill={
            type === 'money'
              ? '#1E293B'
              : type === 'customers'
              ? '#881337'
              : type === 'numbers'
              ? '#064E3B'
              : type === 'rivals'
              ? '#334155'
              : '#78350F'
          }
          stroke="#231F20"
          strokeWidth="6"
        />
        
        {/* Inner dashed stitch ring */}
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="#FAF7F0"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.6"
        />

        {/* 1. MONEY SHARK: Monocle, Gold Tooth, Top Hat / Tie */}
        {type === 'money' && (
          <g>
            {/* Dorsal Fin */}
            <polygon points="100,32 125,72 90,72" fill="#0F172A" stroke="#231F20" strokeWidth="4" />
            
            {/* Body */}
            <path
              d="M 35 125 Q 100 60 170 110 L 165 140 Q 95 165 35 125 Z"
              fill="#334155"
              stroke="#231F20"
              strokeWidth="5"
            />
            {/* Belly */}
            <path
              d="M 60 135 Q 105 160 160 138 L 155 145 Q 100 168 55 140 Z"
              fill="#E2E8F0"
              stroke="#231F20"
              strokeWidth="3"
            />
            {/* Teeth */}
            <polygon points="65,128 72,138 79,128 86,138 93,128" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" />
            {/* Gold tooth */}
            <polygon points="93,128 100,138 107,128" fill="#F59E0B" stroke="#231F20" strokeWidth="2" />
            
            {/* Monocle Eye */}
            <circle cx="85" cy="105" r="14" fill="#F59E0B" stroke="#231F20" strokeWidth="4" />
            <circle cx="85" cy="105" r="9" fill="#1E293B" />
            <circle cx="82" cy="102" r="3" fill="#FFFFFF" />
            <path d="M 99 105 Q 125 125 140 120" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="3 3" />

            {/* Red Bowtie */}
            <polygon points="135,135 150,126 150,144" fill="#D9534F" stroke="#231F20" strokeWidth="3" />
            <polygon points="165,135 150,126 150,144" fill="#D9534F" stroke="#231F20" strokeWidth="3" />
            <circle cx="150" cy="135" r="5" fill="#D9534F" stroke="#231F20" strokeWidth="3" />
          </g>
        )}

        {/* 2. CUSTOMERS SHARK: Retro Heart Shades & Headset */}
        {type === 'customers' && (
          <g>
            {/* Dorsal Fin */}
            <polygon points="95,30 125,75 80,75" fill="#9F1239" stroke="#231F20" strokeWidth="4" />
            
            {/* Body */}
            <path
              d="M 30 120 Q 95 55 170 105 L 162 135 Q 95 165 30 120 Z"
              fill="#E11D48"
              stroke="#231F20"
              strokeWidth="5"
            />
            {/* Belly */}
            <path
              d="M 55 130 Q 100 160 160 135 L 155 142 Q 95 168 50 135 Z"
              fill="#FFE4E6"
              stroke="#231F20"
              strokeWidth="3"
            />
            {/* Grin with teeth */}
            <polygon points="60,123 68,133 76,123 84,133 92,123 100,133" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" />

            {/* Vintage Sunglasses */}
            <rect x="65" y="94" width="28" height="20" rx="6" fill="#1F2937" stroke="#FBBF24" strokeWidth="3" />
            <rect x="98" y="94" width="28" height="20" rx="6" fill="#1F2937" stroke="#FBBF24" strokeWidth="3" />
            <line x1="93" y1="104" x2="98" y2="104" stroke="#FBBF24" strokeWidth="4" />

            {/* DJ / Call-center Headset */}
            <path d="M 68 85 A 40 40 0 0 1 140 95" fill="none" stroke="#FAF7F0" strokeWidth="4" />
            <circle cx="68" cy="98" r="8" fill="#F43F5E" stroke="#231F20" strokeWidth="3" />
            <path d="M 68 98 L 62 120 L 74 123" fill="none" stroke="#FAF7F0" strokeWidth="3" />
            <circle cx="74" cy="123" r="4" fill="#F43F5E" stroke="#231F20" strokeWidth="2" />
          </g>
        )}

        {/* 3. NUMBERS SHARK: Accountant Green Visor, Tortoise Specs */}
        {type === 'numbers' && (
          <g>
            {/* Dorsal Fin */}
            <polygon points="90,30 115,70 75,70" fill="#047857" stroke="#231F20" strokeWidth="4" />
            
            {/* Body */}
            <path
              d="M 30 120 Q 95 60 170 110 L 165 140 Q 95 168 30 120 Z"
              fill="#10B981"
              stroke="#231F20"
              strokeWidth="5"
            />
            {/* Belly */}
            <path
              d="M 55 130 Q 100 162 160 138 L 155 145 Q 95 170 50 135 Z"
              fill="#D1FAE5"
              stroke="#231F20"
              strokeWidth="3"
            />
            {/* Teeth */}
            <polygon points="60,123 68,131 76,123 84,131 92,123" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" />

            {/* Green Sun Visor */}
            <path d="M 55 96 C 80 80 120 85 140 100 L 130 92 C 100 78 70 82 55 96 Z" fill="#34D399" stroke="#231F20" strokeWidth="3" />
            <polygon points="58,96 115,92 110,84 62,87" fill="#059669" stroke="#231F20" strokeWidth="2" />

            {/* Thick Round Spectacles */}
            <circle cx="78" cy="106" r="14" fill="#FFFFFF" stroke="#B45309" strokeWidth="4" />
            <circle cx="112" cy="108" r="14" fill="#FFFFFF" stroke="#B45309" strokeWidth="4" />
            <line x1="92" y1="107" x2="98" y2="107" stroke="#B45309" strokeWidth="4" />
            {/* Pupils looking down at ledger */}
            <circle cx="80" cy="110" r="5" fill="#1F2937" />
            <circle cx="114" cy="112" r="5" fill="#1F2937" />

            {/* Yellow Pencil tucked behind head */}
            <g transform="rotate(25 130 80)">
              <rect x="125" y="70" width="30" height="6" fill="#FBBF24" stroke="#231F20" strokeWidth="2" />
              <polygon points="125,70 118,73 125,76" fill="#FDE68A" stroke="#231F20" strokeWidth="1" />
              <polygon points="120,72 118,73 120,74" fill="#1F2937" />
            </g>
          </g>
        )}

        {/* 4. RIVALS SHARK: Scarred Fin, Eyepatch, Spiked Collar */}
        {type === 'rivals' && (
          <g>
            {/* Battle Scarred Dorsal Fin with bite marks */}
            <path
              d="M 90 32 L 115 50 L 105 56 L 120 75 L 75 75 Z"
              fill="#1E293B"
              stroke="#231F20"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            
            {/* Body */}
            <path
              d="M 30 120 Q 95 60 170 110 L 165 140 Q 95 168 30 120 Z"
              fill="#475569"
              stroke="#231F20"
              strokeWidth="5"
            />
            {/* Belly */}
            <path
              d="M 55 130 Q 100 162 160 138 L 155 145 Q 95 170 50 135 Z"
              fill="#CBD5E1"
              stroke="#231F20"
              strokeWidth="3"
            />

            {/* Sharp Serrated Teeth */}
            <polygon points="56,124 64,136 72,124 80,136 88,124 96,136 104,124" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" />

            {/* Pirate Eyepatch */}
            <circle cx="80" cy="106" r="13" fill="#111827" stroke="#231F20" strokeWidth="3" />
            {/* Eyepatch straps */}
            <line x1="45" y1="95" x2="72" y2="102" stroke="#111827" strokeWidth="4" />
            <line x1="91" y1="110" x2="135" y2="125" stroke="#111827" strokeWidth="4" />

            {/* Fierce Eye */}
            <circle cx="114" cy="104" r="10" fill="#EF4444" stroke="#231F20" strokeWidth="3" />
            <circle cx="114" cy="104" r="5" fill="#111827" />

            {/* Battle Scar over snout */}
            <line x1="50" y1="105" x2="65" y2="115" stroke="#BE123C" strokeWidth="3" />
            <line x1="55" y1="107" x2="52" y2="113" stroke="#BE123C" strokeWidth="2" />
            <line x1="61" y1="109" x2="58" y2="115" stroke="#BE123C" strokeWidth="2" />
          </g>
        )}

        {/* 5. FOUNDER SHARK: Backwards Baseball Cap & Magnifying Loupe */}
        {type === 'founder' && (
          <g>
            {/* Dorsal Fin */}
            <polygon points="90,34 115,75 75,75" fill="#78350F" stroke="#231F20" strokeWidth="4" />

            {/* Backwards Cap Brim & Crown */}
            <path d="M 65 72 Q 100 50 135 72 L 148 76 Q 160 84 145 88 L 125 80 L 65 78 Z" fill="#D9534F" stroke="#231F20" strokeWidth="3" />
            <circle cx="100" cy="62" r="4" fill="#FBBF24" />

            {/* Body */}
            <path
              d="M 30 120 Q 95 60 170 110 L 165 140 Q 95 168 30 120 Z"
              fill="#D97706"
              stroke="#231F20"
              strokeWidth="5"
            />
            {/* Belly */}
            <path
              d="M 55 130 Q 100 162 160 138 L 155 145 Q 95 170 50 135 Z"
              fill="#FEF3C7"
              stroke="#231F20"
              strokeWidth="3"
            />
            {/* Smirk & Teeth */}
            <polygon points="62,125 70,133 78,125 86,133 94,125" fill="#FFFFFF" stroke="#231F20" strokeWidth="2" />

            {/* Intensely focused eyes */}
            <ellipse cx="80" cy="105" rx="10" ry="12" fill="#FFFFFF" stroke="#231F20" strokeWidth="3" />
            <ellipse cx="110" cy="107" rx="10" ry="12" fill="#FFFFFF" stroke="#231F20" strokeWidth="3" />
            <circle cx="82" cy="106" r="5" fill="#1F2937" />
            <circle cx="112" cy="108" r="5" fill="#1F2937" />
            <circle cx="80" cy="104" r="2" fill="#FFFFFF" />
            <circle cx="110" cy="106" r="2" fill="#FFFFFF" />

            {/* Brow lines with intense concentration */}
            <line x1="72" y1="92" x2="90" y2="97" stroke="#231F20" strokeWidth="3" />
            <line x1="120" y1="94" x2="102" y2="98" stroke="#231F20" strokeWidth="3" />

            {/* Magnifying Loupe in mouth or corner */}
            <circle cx="50" cy="130" r="12" fill="none" stroke="#231F20" strokeWidth="3" />
            <circle cx="50" cy="130" r="9" fill="#93C5FD" fillOpacity="0.4" />
            <line x1="58" y1="138" x2="70" y2="148" stroke="#78350F" strokeWidth="4" />
          </g>
        )}
      </svg>

      {/* OUT Stamp Overlay Badge on Avatar if isOut */}
      {isOut && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform -rotate-12 px-3 py-1 bg-red-600/90 text-white font-black text-xs tracking-widest border-2 border-dashed border-white rounded shadow-lg">
            OUT
          </div>
        </div>
      )}

      {/* IN Stamp Overlay Badge on Avatar if isIn */}
      {isIn && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform rotate-6 px-3 py-1 bg-green-700/90 text-white font-black text-xs tracking-widest border-2 border-solid border-white rounded shadow-lg">
            I&apos;M IN!
          </div>
        </div>
      )}
    </div>
  );
};
