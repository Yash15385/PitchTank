# 🦈 PitchTank • The Tactile Shark Pitch Simulator

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14.0-f43f5e?logo=framer)](https://www.framer.com/motion/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-2E4A3E?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

**PitchTank** is a mobile-first, high-stakes startup pitch simulator styled in an authentic **tactile retro paper-craft aesthetic** (`#F5F0E6` warm cream cardstock, `#2E4A3E` chalkboard green, `#D9534F` rubber stamp red, and elegant serif typography).

Test your venture before 5 ruthless AI shark archetypes who scrutinize your valuation, retention, margins, moat, and grit in parallel. When they reject your terms, their physical **"OUT"** placard slams down with spring physics and rubber stamp sound effects. Address their demands on the interactive chalkboard, formulate your rebuttal strategy, and re-enter the tank in Round 2 to close the deal!

---

## 🎨 Tactile Retro Paper-Craft Aesthetics

- **Color Palette**:
  - `Cream Background (#F5F0E6)`: Textured cardstock paper grain with radial dot pattern.
  - `Chalkboard Slate Green (#2E4A3E)`: Vintage classroom chalkboard with chalk dust texture.
  - `Rubber Stamp Red (#D9534F)`: Distressed ink stamp for rejections, alerts, and live badges.
  - `Deal Stamp Green (#1E6B47)`: Rubber ink stamp for syndicate offers and closed deals.
  - `Charcoal Ink (#231F20)`: Deep tactile linework with neubrutalist paper drop shadows.
- **Typography**:
  - **Serif Headings**: *Playfair Display* for dramatic theatrical broadcast lettering.
  - **Monospace Notes**: *Courier Prime* for typewriter shark verdicts, ledgers, and thermal receipts.
  - **Body Sans**: *Plus Jakarta Sans* for clean, modern legibility.
- **Procedural Audio Synthesizer (Web Audio API)**:
  - Synthetic acoustic rubber stamp thud & paper slap on card rejection.
  - Chalk tick clicks when toggling sticky notes.
  - Triumphant multi-tone bell chime on syndicate investment.
  - Zero external MP3 files; instant latency, works offline.

---

## ✨ Key Features

### 1. 🎪 "PITCH NIGHT" Marquee Header & Dossier Input Screen
- **Broadway Marquee Board**: Features dual-phased blinking bulb lights, live broadcast indicator (`🔴 LIVE ON AIR`), sound effect toggle, and AI key configuration.
- **Founder Brief (Form 100-B)**:
  - Manila folder styling with folder tabs, dashed stitching, and paperclip details.
  - Inputs for **Startup Name**, **One-Line Pitch** (with a live 280-character counter), and **Ask** (Capital amount & Equity % with quick chips).
  - **1-Click Sample Pitches**: Instant pre-fills (*KulladKarts*, *ScrapSync*, *AyurGlow AI*, *GullyGamer*) to test pitches immediately.

### 2. 🦈 5-Shark Panel with Animated "OUT" Placards
Each shark features a handcrafted geometric vector SVG avatar and unique investment criteria:
1. **Money Shark — *Vikram 'The Vault' Singhania*** *(Valuation Hawk)*
   - Focus: Dilution, cash runway, exit multiples, down-rounds.
   - Avatar: Navy suit, gold monocle, gold tooth, bowtie.
2. **Customers Shark — *Ananya 'Retention Queen' Roy*** *(Consumer Crusader)*
   - Focus: 90-day repeat rates, organic virality, NPS, churn rate.
   - Avatar: Coral frame, heart sunglasses, call-center headset.
3. **Numbers Shark — *Prof. Murthy 'The Ledger' Swamy*** *(Margin Surgeon)*
   - Focus: COGS, gross margin, logistics leakage, inventory turns.
   - Avatar: Emerald suit, accountant green sun visor, round spectacles, pencil.
   - **Unit Economics Audit**: Displays interactive Sell, Cost, Profit ledger and Gross Margin %.
4. **Rivals Shark — *Kabir 'The Moat' Malhotra*** *(Defense Architect)*
   - Focus: Proprietary IP, barriers to entry, big tech cloning risk.
   - Avatar: Steel gray silhouette, scarred dorsal fin, pirate eyepatch.
5. **Founder Shark — *Zoya 'Hustle Detective' Khan*** *(Grit & Integrity)*
   - Focus: Coachability, domain obsession, skin in the game, operational sweat.
   - Avatar: Amber silhouette, backwards baseball cap, magnifying loupe.
- **Framer Motion Placard Physics**:
  - Rejection triggers a distressed rubber stamp **"OUT"** placard slamming from `scale: 3` to `scale: 1` at a `-7°` tilt with a spring bounce and heavy audio thud.
  - Investment triggers an **"I'M IN!"** green placard with exact syndicate terms.

### 3. ⚡ Multi-Model Parallel API Route (`/api/pitch`)
- Sends the pitch to **5 distinct system prompts in parallel** using `Promise.all`.
- Supports **Google Gemini API** (`gemini-2.5-flash`) and **OpenRouter** (`google/gemini-2.5-flash`).
- **Zero-Setup Intelligent Fallback**: If no API key is provided, the route uses a built-in heuristic analysis engine that evaluates industry economics, computes realistic unit margins, and produces biting shark dialogue.
- Strict JSON schema:
  ```json
  {
    "shark": "numbers",
    "sharkName": "Prof. Murthy 'The Ledger' Swamy",
    "title": "MARGIN SURGEON",
    "status": "OUT",
    "sharpQuestion": "What is your true net contribution margin after reverse logistics?",
    "fixItem": "Reduce bill-of-materials to lock in a minimum 40% clean gross margin.",
    "harshQuote": "The numbers don't lie, and I am OUT.",
    "unitEconomics": { "sell": 1200, "cost": 650, "profit": 550, "currency": "₹" }
  }
  ```

### 4. 📋 Interactive Chalkboard Fix List
- Textured slate chalkboard green (`#2E4A3E`) with chalk dust particles, wooden frame, and chalk progress tracker (`X / 5 Addressed`).
- Each shark's `fixItem` appears on a pastel **sticky note** pinned with washi tape.
- Checkable scratchy chalk checkboxes with strikethrough animations.
- Expandable **Rebuttal Strategy** text inputs to prepare revised counter-offers.

### 5. 🎯 Round 2 Re-Pitch & Syndicate Term Sheet
- **Re-Pitch Evaluation**: Submits revised rebuttals back to the panel to test if the founder satisfied the sharks' demands.
- Convinced sharks flip dynamically from **OUT** to **IN**.
- **Celebration Effects**: Realistic multi-colored paper streamer confetti (`canvas-confetti`) and victory cash register chime.
- **Thermal Perforated Term Sheet Receipt**:
  - Jagged perforated paper cut edges.
  - Final valuation, participating syndicate members, barcode SVG, and green rubber stamp: **"DEAL CLOSED"**.
  - Web Share API support to broadcast your deal victory.

### 6. 📱 Progressive Web App (PWA)
- Fully installable on iOS and Android with standalone mobile app frame.
- Custom vector SVG icons (`192x192`, `512x512`), safe-area padding, and an in-app `beforeinstallprompt` banner.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Physics**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.react.dev/)
- **Confetti**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio**: Web Audio API (procedural synthesis)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/pitchtank.git
cd pitchtank
npm install
```

### 2. Configure Environment Variables (Optional)

PitchTank runs **100% out of the box** in Auto Demo mode with zero configuration. To use live LLMs, create a `.env.local` file or configure keys directly in the in-app modal:

```bash
# Optional: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. (Switch to Mobile View in Chrome DevTools for the mobile-first experience).

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
d:\PitchTank
├── public/
│   ├── icons/
│   │   ├── icon-192.svg          # 192x192 PWA Shark Icon
│   │   └── icon-512.svg          # 512x512 PWA Shark Icon
│   └── manifest.json             # PWA Web App Manifest
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── pitch/
│   │   │       └── route.ts      # Multi-model parallel shark API route
│   │   ├── globals.css           # Papercraft theme, Google fonts, drop shadows
│   │   ├── layout.tsx            # Viewport, PWA metadata, manifest links
│   │   └── page.tsx              # Main mobile-first application screen
│   ├── components/
│   │   ├── ApiKeyModal.tsx       # Classified folder AI engine configuration
│   │   ├── ChalkboardFixList.tsx # Vintage chalkboard with pinned sticky notes
│   │   ├── GeometricSharkAvatar.tsx # Handcrafted SVG avatars for 5 sharks
│   │   ├── MarqueeHeader.tsx     # Broadway marquee header with bulb lights
│   │   ├── PitchForm.tsx         # Manila folder pitch input form
│   │   ├── Round2RePitch.tsx     # Round 2 re-pitch triggers & negotiations
│   │   ├── SharkCard.tsx         # Individual shark card & Framer Motion stamp
│   │   ├── SharkPanel.tsx        # 5-shark panel grid & scoreboard
│   │   └── TermSheetReceipt.tsx  # Perforated thermal paper deal receipt
│   ├── lib/
│   │   ├── sharkArchetypes.ts    # Prompts, sample pitches & simulation engine
│   │   └── sounds.ts             # Web Audio API sound synthesizer
│   └── types/
│       └── pitch.ts              # TypeScript interfaces for sharks & pitches
├── package.json
└── tsconfig.json
```

---

## 📜 License

MIT License. Built with ❤️ for founders stepping into the tank.
