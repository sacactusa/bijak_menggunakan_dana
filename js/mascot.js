/**
 * Ruang Belajar Ceria - Mascot "Ciko si Kancil Pintar"
 * Handcrafted child-friendly vector mascot illustrations.
 */
const RBC_MASCOT = {
  render: (mood = 'happy', size = 'w-24 h-24') => {
    return `
    <div class="relative inline-block ${size} select-none transform transition-transform hover:scale-105">
      <svg viewBox="0 0 120 120" class="w-full h-full filter drop-shadow-md">
        <!-- Antlers -->
        <path d="M42 32 C38 18 30 16 26 18 C28 24 34 26 38 34" stroke="#854d0e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M78 32 C82 18 90 16 94 18 C92 24 86 26 82 34" stroke="#854d0e" stroke-width="3.5" fill="none" stroke-linecap="round"/>

        <!-- Ears -->
        <path d="M30 46 C20 38 18 24 28 28 C34 30 38 38 40 44 Z" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
        <path d="M30 44 C24 38 22 28 28 31 C32 33 34 38 36 42 Z" fill="#fde68a"/>
        <path d="M90 46 C100 38 102 24 92 28 C86 30 82 38 80 44 Z" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
        <path d="M90 44 C96 38 98 28 92 31 C88 33 86 38 84 42 Z" fill="#fde68a"/>

        <!-- Body / Shirt -->
        <rect x="36" y="78" width="48" height="38" rx="16" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
        <!-- Collar -->
        <polygon points="50,78 60,90 70,78 65,78 60,84 55,78" fill="#ffffff"/>
        <!-- Backpack straps -->
        <path d="M38 82 L38 110" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <path d="M82 82 L82 110" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>

        <!-- Head -->
        <ellipse cx="60" cy="56" rx="32" ry="28" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
        <!-- Snout Area -->
        <ellipse cx="60" cy="65" rx="18" ry="14" fill="#fef3c7"/>
        <!-- Nose -->
        <polygon points="56,58 64,58 60,63" fill="#78350f"/>
        
        <!-- Eyes -->
        ${mood === 'cheering' ? `
          <path d="M44 50 Q50 42 54 50" stroke="#451a03" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M66 50 Q70 42 76 50" stroke="#451a03" stroke-width="3" fill="none" stroke-linecap="round"/>
        ` : `
          <ellipse cx="48" cy="49" rx="5" ry="6" fill="#451a03"/>
          <circle cx="46.5" cy="47" r="2" fill="#ffffff"/>
          <ellipse cx="72" cy="49" rx="5" ry="6" fill="#451a03"/>
          <circle cx="70.5" cy="47" r="2" fill="#ffffff"/>
        `}

        <!-- Eyebrows -->
        <path d="M42 41 Q48 38 52 42" stroke="#92400e" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M68 42 Q72 38 78 41" stroke="#92400e" stroke-width="2" fill="none" stroke-linecap="round"/>

        <!-- Cheeks -->
        <circle cx="40" cy="60" r="5" fill="#f43f5e" opacity="0.45"/>
        <circle cx="80" cy="60" r="5" fill="#f43f5e" opacity="0.45"/>

        <!-- Mouth -->
        ${mood === 'happy' || mood === 'cheering' ? `
          <path d="M54 66 Q60 74 66 66" stroke="#78350f" stroke-width="2.5" fill="#f87171" stroke-linecap="round"/>
        ` : `
          <path d="M55 67 Q60 70 65 67" stroke="#78350f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `}

        <!-- Gold Coin in Hand -->
        <g transform="translate(82, 70)">
          <circle cx="12" cy="12" r="11" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <text x="12" y="16" font-size="9" font-weight="bold" fill="#854d0e" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp</text>
        </g>
      </svg>
    </div>`;
  },

  bubble: (message, mood = 'happy') => {
    return `
    <div class="flex items-start gap-4 p-4 md:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl shadow-sm mb-6 animate-bounce-gentle">
      <div class="flex-shrink-0">
        ${RBC_MASCOT.render(mood, 'w-16 h-16 md:w-20 md:h-20')}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">Teman Belajarmu</span>
          <span class="font-bold text-amber-900 text-sm">Ciko si Kancil</span>
        </div>
        <p class="text-slate-700 text-sm md:text-base leading-relaxed font-medium">${message}</p>
      </div>
    </div>`;
  }
};

window.RBC_MASCOT = RBC_MASCOT;

