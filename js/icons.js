/**
 * Ruang Belajar Ceria - Upgraded Child-Friendly Colorful SVG Icons
 * Sized perfectly to match the website layout and navigation bars.
 */
const RBC_ICONS = {
  // 1. Beranda (Home)
  home: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15C14.4 21 14 20.6 14 20V15C14 14.4 13.6 14 13 14H11C10.4 14 10 14.4 10 15V20C10 20.6 9.6 21 9 21H4C3.4 21 3 20.6 3 20V10.5Z" fill="#FEF08A" stroke="#D97706" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="10" y="14" width="4" height="7" rx="1" fill="#F59E0B"/>
      <path d="M18 7V4H15" stroke="#D97706" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  // 2. D - Dekatkan (Sparkles / Coin Search)
  dekatkan: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="10" r="7" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
      <path d="M15.5 15.5L21 21" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="4.2" fill="#FACC15" stroke="#CA8A04" stroke-width="1.2"/>
      <text x="10" y="12" font-size="4.5" font-weight="bold" fill="#713F12" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp</text>
    </svg>`,

  // 3. H - Hubungkan (Interlocking Links / Goods)
  hubungkan: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="10" height="10" rx="5" fill="#D1FAE5" stroke="#059669" stroke-width="2"/>
      <rect x="12" y="7" width="10" height="10" rx="5" fill="#A7F3D0" stroke="#047857" stroke-width="2"/>
      <circle cx="12" cy="12" r="2.2" fill="#10B981"/>
    </svg>`,

  // 4. E - Eksplorasi (Market Niza Shopping Basket & Coin)
  eksplorasi: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <path d="M4 8H20L18 19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19L4 8Z" fill="#FFEDD5" stroke="#EA580C" stroke-width="2"/>
      <path d="M8 8V6C8 3.8 9.8 2 12 2C14.2 2 16 3.8 16 6V8" stroke="#EA580C" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="14" r="2.5" fill="#F97316"/>
    </svg>`,

  // 5. T - Tukar Gagasan (Chat Bubbles)
  tukarGagasan: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <path d="M19 12.5C19 15.8 15.9 18.5 12 18.5C10.7 18.5 9.5 18.2 8.4 17.6L4 19L5.4 15.1C4.5 14.3 4 13.4 4 12.5C4 9.2 7.1 6.5 11 6.5C14.9 6.5 19 9.2 19 12.5Z" fill="#EDE9FE" stroke="#7C3AED" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="8.5" cy="12.5" r="1.2" fill="#6D28D9"/>
      <circle cx="11.5" cy="12.5" r="1.2" fill="#6D28D9"/>
      <circle cx="14.5" cy="12.5" r="1.2" fill="#6D28D9"/>
    </svg>`,

  // 6. I - Ikat Konsep (Lightbulb & Knowledge)
  ikatKonsep: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <path d="M9 18H15M10 21H14M12 2C7.6 2 4 5.6 4 10C4 12.8 5.4 15.2 7.6 16.6C8.2 17 8.6 17.7 8.7 18.4L8.7 18.5H15.3L15.3 18.4C15.4 17.7 15.8 17 16.4 16.6C18.6 15.2 20 12.8 20 10C20 5.6 16.4 2 12 2Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 10L14 10" stroke="#EAB308" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

  // 7. K - Karyaku (Paint Palette & Craft)
  karyaku: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C13.1 22 14 21.1 14 20C14 19.5 13.8 19 13.5 18.6C13.2 18.2 13 17.7 13 17.2C13 16.1 13.9 15.2 15 15.2H17C19.8 15.2 22 13 22 10.2C22 5.7 17.5 2 12 2Z" fill="#E0E7FF" stroke="#4F46E5" stroke-width="1.8"/>
      <circle cx="7.5" cy="10" r="1.5" fill="#EF4444"/>
      <circle cx="11.5" cy="6.5" r="1.5" fill="#F59E0B"/>
      <circle cx="16.5" cy="8.5" r="1.5" fill="#10B981"/>
      <circle cx="17.5" cy="12.5" r="1.5" fill="#3B82F6"/>
    </svg>`,

  // 8. Video Pembelajaran
  video: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="15" rx="3.5" fill="#FFE4E6" stroke="#E11D48" stroke-width="1.8"/>
      <polygon points="10,9 16,12.5 10,16" fill="#E11D48"/>
    </svg>`,

  // 9. Kuis Interaktif
  quiz: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="1.8"/>
      <rect x="8" y="1" width="8" height="3" rx="1.5" fill="#F59E0B"/>
      <path d="M8 9H16M8 13H14M8 17H12" stroke="#B45309" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="2.5" fill="#10B981"/>
      <path d="M15 16L15.8 16.8L17.2 15.4" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

  // 10. Game Edukasi
  gamepad: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="12" rx="6" fill="#CCFBF1" stroke="#0D9488" stroke-width="1.8"/>
      <path d="M6 12H10M8 10V14" stroke="#0F766E" stroke-width="2" stroke-linecap="round"/>
      <circle cx="15.5" cy="10.5" r="1.2" fill="#F43F5E"/>
      <circle cx="17.5" cy="13.5" r="1.2" fill="#F59E0B"/>
    </svg>`,

  // 11. Kontak
  kontak: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
      <path d="M3 8L12 14L21 8" stroke="#0284C7" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="10.5" r="1.5" fill="#EF4444"/>
    </svg>`,

  // 12. Tentang
  info: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5V5C4 3.9 4.9 3 6 3H20V21H6C4.9 21 4 20.1 4 19.5Z" fill="#F1F5F9" stroke="#475569" stroke-width="1.8"/>
      <circle cx="12" cy="13" r="3" fill="#6366F1"/>
      <path d="M12 11.5V13M12 14.5H12.01" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

  // 13. Dashboard Guru
  guru: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="12" rx="2" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.8"/>
      <path d="M8 20L12 16L16 20" stroke="#16A34A" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M7 8.5H13M7 11.5H11" stroke="#15803D" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="17" cy="8.5" r="1.5" fill="#EA580C"/>
    </svg>`,

  // User Student Avatar
  userAvatar: (cls = "w-5 h-5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4.5" fill="#FED7AA" stroke="#EA580C" stroke-width="1.5"/>
      <path d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  // Star & Coin SVGs
  star: (cls = "w-4 h-4") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`,

  coin: (cls = "w-4 h-4") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FACC15" stroke="#CA8A04" stroke-width="1.8"/>
      <text x="12" y="15.5" font-size="8" font-weight="black" fill="#713F12" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp</text>
    </svg>`,

  // Sound Buttons
  volume2: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#E0F2FE"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>`,

  volumeX: (cls = "w-4.5 h-4.5") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#F1F5F9"/>
      <line x1="22" x2="16" y1="9" y2="15"/>
      <line x1="16" x2="22" y1="9" y2="15"/>
    </svg>`,

  // Celengan Ayam Tradisional SVG
  celenganAyam: (cls = "w-10 h-10") => `
    <svg class="${cls}" viewBox="0 0 48 48" fill="none">
      <!-- Badan Celengan Ayam Merah Ceria -->
      <ellipse cx="23" cy="27" rx="15" ry="13" fill="#F87171" stroke="#DC2626" stroke-width="2.5"/>
      <!-- Jengger Ayam / Comb -->
      <path d="M22 14 C22 9 27 7 28 13 C29 9 34 9 33 15" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
      <path d="M29 13 C31 8 36 9 35 15" fill="#EF4444"/>
      <!-- Paruh Kuning Emas / Beak -->
      <polygon points="36,22 43,25 36,28" fill="#FBBF24" stroke="#D97706" stroke-width="1.5"/>
      <!-- Gelambir Ayam / Wattle -->
      <path d="M35 28 C36 32 32 33 32 29 Z" fill="#DC2626" stroke="#B91C1C" stroke-width="1.5"/>
      <!-- Mata Lucu / Eye -->
      <circle cx="31" cy="20" r="2.5" fill="#FFFFFF"/>
      <circle cx="32" cy="20" r="1.3" fill="#0F172A"/>
      <!-- Sayap / Wing -->
      <path d="M14 26 C16 22 23 21 21 28 C19 32 15 31 14 26 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="1.8"/>
      <!-- Lubang Koin di Punggung / Coin Slot -->
      <rect x="17" y="13" width="7" height="2.2" rx="1.1" fill="#0F172A"/>
      <circle cx="20.5" cy="10" r="2.2" fill="#FACC15" stroke="#CA8A04" stroke-width="1"/>
      <!-- Kaki Celengan / Feet -->
      <path d="M17 40 L17 44 M25 40 L25 44" stroke="#D97706" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Ekor Melengkung / Tail Feathers -->
      <path d="M8 27 C5 22 7 16 12 18" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </svg>`,

  // Mainan Tanah Liat Berwarna (Slime / Clay Warna)
  clayWarna: (cls = "w-9 h-9") => `
    <svg class="${cls}" viewBox="0 0 36 36" fill="none">
      <!-- Papan Kerajinan Kayu -->
      <rect x="2" y="27" width="32" height="5" rx="2" fill="#D97706" opacity="0.3"/>
      <!-- Gumpalan Tanah Liat Hijau Mint -->
      <path d="M4 27 C3 21 11 19 15 23 C17 25 17 27 4 27 Z" fill="#34D399" stroke="#059669" stroke-width="1.2"/>
      <!-- Gumpalan Tanah Liat Kuning Cerah -->
      <circle cx="26" cy="23" r="5.5" fill="#FBBF24" stroke="#D97706" stroke-width="1.2"/>
      <!-- Gumpalan Tanah Liat Utama Merah Muda & Ungu -->
      <ellipse cx="15" cy="19" rx="8" ry="6.5" fill="#F472B6" stroke="#DB2777" stroke-width="1.4"/>
      <ellipse cx="14" cy="16" rx="5" ry="3.5" fill="#C084FC" stroke="#9333EA" stroke-width="1.2"/>
      <circle cx="13" cy="13" r="2.5" fill="#60A5FA" stroke="#2563EB" stroke-width="1"/>
      <!-- Pisau Pemodel Tanah Liat (Modeling Tool) -->
      <rect x="23" y="6" width="3" height="18" rx="1.5" transform="rotate(32 23 6)" fill="#F59E0B" stroke="#B45309" stroke-width="1"/>
      <polygon points="21,21 24,25 20,26" fill="#FBBF24" stroke="#B45309" stroke-width="0.8"/>
      <!-- Tekstur & Kilau Lembut -->
      <circle cx="12" cy="18" r="0.8" fill="#FFFFFF"/>
      <circle cx="27" cy="21" r="0.8" fill="#FFFFFF"/>
    </svg>`,

  // Gambar Asli Uang Logam Resmi Bank Indonesia (Emisi 2016)
  rupiahCoin: (val, cls = "w-24 h-24 sm:w-28 sm:h-28", side = "depan") => {
    const v = parseInt(val, 10);
    const validCoins = [100, 200, 500, 1000];
    const coinVal = validCoins.includes(v) ? v : 500;
    const coinSide = (side === "belakang") ? "belakang" : "depan";
    const altLabel = coinSide === "depan"
      ? `Uang Logam Rp${coinVal.toLocaleString('id-ID')} Sisi Nominal`
      : `Uang Logam Rp${coinVal.toLocaleString('id-ID')} Sisi Pahlawan`;

    return `
      <div class="${cls} rounded-full overflow-hidden shadow-lg border-2 border-slate-300 bg-slate-100 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
        <img src="assets/images/uang/koin-${coinVal}-${coinSide}.jpg" alt="${altLabel}" class="w-full h-full object-cover scale-[1.03]" loading="lazy" />
      </div>`;
  },

  // Gambar Asli Uang Kertas Resmi Bank Indonesia (Tahun Emisi 2022)
  rupiahBanknote: (val, cls = "w-full h-auto") => {
    const v = parseInt(val, 10);
    const validNotes = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
    const noteVal = validNotes.includes(v) ? v : 1000;

    return `
      <div class="${cls} rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white transition-transform group-hover:scale-[1.02]">
        <img src="assets/images/uang/kertas-${noteVal}.jpg" alt="Uang Kertas Rp${noteVal.toLocaleString('id-ID')} Tahun Emisi 2022" class="w-full h-auto block object-contain" loading="lazy" />
      </div>`;
  },

  // UPI Cibiru Official Logo
  upiLogo: (cls = "w-12 h-12") => `
    <div class="${cls} rounded-full bg-white p-1.5 shadow-md border-2 border-red-200 ring-2 ring-amber-200/60 inline-flex items-center justify-center flex-shrink-0">
      <img src="assets/images/logo.png" alt="Logo UPI" class="w-full h-full object-contain" />
    </div>`
};

window.RBC_ICONS = RBC_ICONS;
