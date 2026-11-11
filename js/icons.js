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

  // Ilustrasi Uang Logam (Koin) Realistis Indonesia (Emisi 2016)
  rupiahCoin: (val, cls = "w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg") => {
    const v = parseInt(val, 10);
    const uid = Math.random().toString(36).slice(2, 7);
    const is1000 = (v === 1000);
    const is500 = (v === 500);
    const meta = {
      100: {
        num: "100",
        sub: "BURUNG KAKAKTUA",
        year: "2016",
        // Burung Kakaktua Raja bas-relief silhouette (positioned cleanly at left x=16..44)
        motif: `
          <g opacity="0.58" transform="translate(17, 36) scale(0.76)">
            <path d="M18 10 C15 4 21 1 25 4 C23 2 27 2 28 6 C30 5 32 7 30 10 C33 11 33 15 29 17 C31 24 27 32 21 37 L15 39 C17 32 14 25 14 19 C11 19 9 15 12 12 C14 11 16 11 18 10 Z" fill="url(#metalDark_${uid})" stroke="#FFFFFF" stroke-width="0.6" stroke-opacity="0.7"/>
            <path d="M12 13 C9 14 9 17 12 18 C13 16 13 14 12 13 Z" fill="#475569"/>
            <circle cx="16.5" cy="12" r="1.2" fill="#FFFFFF"/>
            <path d="M18 20 C22 21 25 25 23 32" fill="none" stroke="#FFFFFF" stroke-width="0.7" stroke-opacity="0.6"/>
          </g>`
      },
      200: {
        num: "200",
        sub: "JALAK BALI",
        year: "2016",
        // Burung Jalak Bali perched bas-relief silhouette (x=16..44)
        motif: `
          <g opacity="0.6" transform="translate(15, 37) scale(0.76)">
            <path d="M22 8 C26 4 32 5 35 7 C31 8 28 9 27 11 C31 12 32 15 30 18 C32 23 28 30 22 34 L12 39 L15 32 C12 28 13 21 17 17 C16 13 18 9 22 8 Z" fill="url(#metalDark_${uid})" stroke="#FFFFFF" stroke-width="0.6" stroke-opacity="0.7"/>
            <path d="M15 15 L10 16 L15 18 Z" fill="#475569"/>
            <circle cx="19" cy="14" r="1.3" fill="#FFFFFF"/>
            <path d="M8 38 Q22 33 34 36" fill="none" stroke="#64748B" stroke-width="1.3" stroke-linecap="round"/>
          </g>`
      },
      500: {
        num: "500",
        sub: "BUNGA MELATI",
        year: "2016",
        // Bunga Melati 5-petal realistic floral relief (centered left cx=31, cy=56)
        motif: `
          <g opacity="0.65" transform="translate(31, 56) scale(0.88)">
            <g fill="url(#metalLight_${uid})" stroke="#64748B" stroke-width="0.7">
              <ellipse cx="0" cy="-9" rx="4.2" ry="7.5"/>
              <ellipse cx="8.5" cy="-2.8" rx="4.2" ry="7.5" transform="rotate(72)"/>
              <ellipse cx="5.2" cy="7.2" rx="4.2" ry="7.5" transform="rotate(144)"/>
              <ellipse cx="-5.2" cy="7.2" rx="4.2" ry="7.5" transform="rotate(216)"/>
              <ellipse cx="-8.5" cy="-2.8" rx="4.2" ry="7.5" transform="rotate(288)"/>
            </g>
            <circle cx="0" cy="0" r="3" fill="#94A3B8" stroke="#FFFFFF" stroke-width="0.7"/>
            <path d="M-8 10 Q-14 14 -12 20 Q-6 18 -4 12 Z" fill="#64748B" opacity="0.75"/>
          </g>`
      },
      1000: {
        num: "1000",
        sub: "MR. I GUSTI KETUT PUDJA",
        year: "2016",
        // Portrait bust relief Mr. I Gusti Ketut Pudja (x=21..43)
        motif: `
          <g opacity="0.62" transform="translate(19, 39) scale(0.85)">
            <ellipse cx="14" cy="14" rx="7.5" ry="9" fill="url(#metalDark_${uid})" stroke="#FFFFFF" stroke-width="0.6" stroke-opacity="0.7"/>
            <path d="M7 11 C8 6 20 6 21 11 C19 8 9 8 7 11 Z" fill="#475569"/>
            <circle cx="11.2" cy="13.2" r="2.1" fill="none" stroke="#FFFFFF" stroke-width="0.75"/>
            <circle cx="16.8" cy="13.2" r="2.1" fill="none" stroke="#FFFFFF" stroke-width="0.75"/>
            <line x1="13.3" y1="13.2" x2="14.7" y2="13.2" stroke="#FFFFFF" stroke-width="0.7"/>
            <path d="M5 29 C5 22 23 22 23 29 L24 35 L4 35 Z" fill="url(#metalDark_${uid})" stroke="#FFFFFF" stroke-width="0.6" stroke-opacity="0.6"/>
            <path d="M11 23 L14 29 L17 23" fill="none" stroke="#FFFFFF" stroke-width="0.7"/>
          </g>`
      }
    }[v] || { num: String(val), sub: "RUPIAH", year: "2016", motif: "" };

    return `
      <svg class="${cls} transition-transform group-hover:scale-105" viewBox="0 0 120 120" fill="none">
        <defs>
          <!-- Realistic Brushed Metal Outer Rim Gradient -->
          <linearGradient id="rimGrad_${uid}" x1="10%" y1="5%" x2="90%" y2="95%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="20%" stop-color="#CBD5E1"/>
            <stop offset="45%" stop-color="#64748B"/>
            <stop offset="70%" stop-color="#F1F5F9"/>
            <stop offset="88%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#94A3B8"/>
          </linearGradient>

          <!-- Realistic Satin Metallic Coin Face -->
          <radialGradient id="faceGrad_${uid}" cx="35%" cy="30%" r="72%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="28%" stop-color="${is1000 ? '#F1F5F9' : is500 ? '#F8FAFC' : '#F1F5F9'}"/>
            <stop offset="68%" stop-color="${is1000 ? '#CBD5E1' : '#CBD5E1'}"/>
            <stop offset="92%" stop-color="${is1000 ? '#94A3B8' : '#94A3B8'}"/>
            <stop offset="100%" stop-color="#64748B"/>
          </radialGradient>

          <!-- Specular Diagonal Metal Sheen -->
          <linearGradient id="sheen_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
            <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.1"/>
            <stop offset="52%" stop-color="#FFFFFF" stop-opacity="0.45"/>
            <stop offset="65%" stop-color="#FFFFFF" stop-opacity="0.0"/>
            <stop offset="100%" stop-color="#1E293B" stop-opacity="0.18"/>
          </linearGradient>

          <!-- Bas-Relief Gradients -->
          <linearGradient id="metalDark_${uid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#94A3B8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="metalLight_${uid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#94A3B8"/>
          </linearGradient>

          <!-- Realistic Embossed Text Shadow -->
          <filter id="coinEmboss_${uid}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.8" dy="0.9" stdDeviation="0.4" flood-color="#FFFFFF" flood-opacity="0.95"/>
            <feDropShadow dx="-0.7" dy="-0.7" stdDeviation="0.4" flood-color="#334155" flood-opacity="0.75"/>
          </filter>
        </defs>

        <!-- Drop Shadow Below Coin -->
        <circle cx="60" cy="62" r="56" fill="#0F172A" opacity="0.18"/>

        <!-- Reeded Outer Collar Edge -->
        <circle cx="60" cy="60" r="56" fill="url(#rimGrad_${uid})" stroke="#475569" stroke-width="1.2"/>
        <!-- Milled Coin Edge Teeth -->
        <circle cx="60" cy="60" r="54.2" fill="none" stroke="#F8FAFC" stroke-width="1.8" stroke-dasharray="1.6 1.8" opacity="0.85"/>
        <circle cx="60" cy="60" r="52" fill="url(#rimGrad_${uid})" stroke="#64748B" stroke-width="0.9"/>

        <!-- Recessed Coin Face Field with Inner Rim Shadow -->
        <circle cx="60" cy="60" r="48.5" fill="url(#faceGrad_${uid})" stroke="#475569" stroke-width="0.8"/>
        <circle cx="60" cy="60" r="48" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.65"/>

        <!-- Subtle Concentric Lathe Ring Brushing -->
        <circle cx="60" cy="60" r="42" fill="none" stroke="#64748B" stroke-width="0.35" opacity="0.35"/>
        <circle cx="60" cy="60" r="36" fill="none" stroke="#FFFFFF" stroke-width="0.4" opacity="0.45"/>

        ${is1000 ? `<circle cx="60" cy="60" r="39" fill="none" stroke="#64748B" stroke-width="1.1" stroke-dasharray="2.2 1.8" opacity="0.65"/>` : ''}

        <!-- Diagonal Metallic Specular Glint -->
        <circle cx="60" cy="60" r="48" fill="url(#sheen_${uid})"/>

        <!-- Bas-Relief Artwork (Left Side) -->
        ${meta.motif}

        <!-- Curved Top Engraving: BANK INDONESIA -->
        <path id="arcTop_${uid}" d="M 21 60 A 39 39 0 0 1 99 60" fill="none"/>
        <text font-size="6.8" font-weight="900" font-family="'Arial', sans-serif" fill="#334155" letter-spacing="1.4" filter="url(#coinEmboss_${uid})">
          <textPath href="#arcTop_${uid}" startOffset="50%" text-anchor="middle">BANK INDONESIA</textPath>
        </text>

        <!-- Ornamental Rim Dots -->
        <circle cx="19" cy="60" r="1.4" fill="#475569"/>
        <circle cx="101" cy="60" r="1.4" fill="#475569"/>

        <!-- Large Stamped Nominal Number (Shifted Slightly Right to Frame Relief Cleanly) -->
        <text x="${is1000 ? 73 : 71}" y="${is1000 ? 64 : 66}" font-size="${is1000 ? 17.5 : 22}" font-weight="900" font-family="'Fredoka', 'Arial Black', sans-serif" fill="#334155" text-anchor="middle" filter="url(#coinEmboss_${uid})">
          ${meta.num}
        </text>

        <!-- Sub-caption RUPIAH -->
        <text x="${is1000 ? 73 : 71}" y="77" font-size="6.8" font-weight="900" font-family="'Arial', sans-serif" fill="#475569" letter-spacing="1" text-anchor="middle" filter="url(#coinEmboss_${uid})">
          RUPIAH
        </text>

        <!-- Curved Bottom Engraving: Year & Subject -->
        <path id="arcBot_${uid}" d="M 22 65 A 38.5 38.5 0 0 0 98 65" fill="none"/>
        <text font-size="5" font-weight="800" font-family="'Arial', sans-serif" fill="#475569" letter-spacing="0.8">
          <textPath href="#arcBot_${uid}" startOffset="50%" text-anchor="middle">${meta.sub} • ${meta.year}</textPath>
        </text>
      </svg>`;
  },

  // Ilustrasi Uang Kertas Realistis Indonesia (Seri TE 2022)
  rupiahBanknote: (val, cls = "w-full h-auto drop-shadow-md") => {
    const v = parseInt(val, 10);
    const uid = Math.random().toString(36).slice(2, 7);

    const data = {
      1000: {
        num: "1000",
        label: "Rp1.000",
        name: "Seribu Rupiah Kertas",
        hero: "Tjut Meutia",
        spelled: "SERIBU RUPIAH",
        serial: "TMT 202201",
        c1: "#859922", c2: "#B8C73F", c3: "#E7EE8C", dark: "#4A5912", skin: "#D9B98B", accent: "#EAB308",
        flower: `
          <g opacity="0.24" transform="translate(115, 76)">
            <ellipse cx="0" cy="0" rx="22" ry="11" fill="#FFFFFF" transform="rotate(-25)"/>
            <ellipse cx="14" cy="-10" rx="18" ry="9" fill="#FEF08A" transform="rotate(35)"/>
            <ellipse cx="-14" cy="-10" rx="18" ry="9" fill="#FEF08A" transform="rotate(-35)"/>
            <circle cx="0" cy="-3" r="6" fill="#4A5912"/>
          </g>`,
        portrait: `
          <!-- Tjut Meutia Authentic Engraved Portrait -->
          <g transform="translate(215, 22)">
            <!-- Draped Acehnese Shawl / Kerudung -->
            <path d="M16 56 C12 30 22 10 42 10 C62 10 70 28 66 56 L78 108 L6 108 Z" fill="#3F4D10"/>
            <path d="M22 52 C20 30 28 16 42 16 C56 16 62 30 60 52 C60 66 52 80 42 84 C32 80 24 66 22 52 Z" fill="#5A6C19"/>
            <!-- Gold Embroidered Kerudung Trim -->
            <path d="M24 44 C24 24 32 16 42 16 C52 16 58 26 58 44" fill="none" stroke="#FDE047" stroke-width="1.6" stroke-dasharray="2 1.5"/>
            <!-- Realistic Face Shaded Oval -->
            <ellipse cx="41" cy="40" rx="14.5" ry="18.5" fill="#DFC39D" stroke="#654F32" stroke-width="0.7"/>
            <!-- Hair Parting inside Kerudung -->
            <path d="M27 34 C29 24 53 24 55 34 C51 28 31 28 27 34 Z" fill="#2E2618"/>
            <!-- Brows & Eyes -->
            <path d="M32 36 Q35.5 34.5 38.5 36 M43.5 36 Q46.5 34.5 50 36" stroke="#3F2E18" stroke-width="1.1" fill="none" stroke-linecap="round"/>
            <ellipse cx="35.5" cy="39" rx="2.1" ry="1.2" fill="#2E2212"/>
            <ellipse cx="46.5" cy="39" rx="2.1" ry="1.2" fill="#2E2212"/>
            <!-- Nose & Subtle Chin/Smile Shading -->
            <path d="M41 38 L40 45 L42.5 46" stroke="#8C6D46" stroke-width="0.9" fill="none" stroke-linecap="round"/>
            <path d="M36.5 50.5 Q41 53 45.5 50.5" stroke="#785334" stroke-width="1" fill="none" stroke-linecap="round"/>
            <!-- Traditional Collar Pin / Kebaya -->
            <path d="M20 74 L41 96 L62 74" fill="none" stroke="#FEF08A" stroke-width="1.4"/>
            <circle cx="41" cy="78" r="2.5" fill="#FACC15" stroke="#713F12" stroke-width="0.6"/>
            <!-- Intaglio Line Shading -->
            <path d="M28 48 Q41 58 54 48" stroke="#654F32" stroke-width="0.4" opacity="0.4" fill="none"/>
          </g>`
      },
      2000: {
        num: "2000",
        label: "Rp2.000",
        name: "Dua Ribu Rupiah",
        hero: "Mohammad Hoesni Thamrin",
        spelled: "DUA RIBU RUPIAH",
        serial: "MHT 202202",
        c1: "#475569", c2: "#7D8CA1", c3: "#D8E0EA", dark: "#1E293B", skin: "#CBD5E1", accent: "#94A3B8",
        flower: `
          <g opacity="0.24" transform="translate(115, 76)">
            <circle cx="0" cy="-6" r="14" fill="#FFFFFF"/>
            <circle cx="12" cy="4" r="13" fill="#E2E8F0"/>
            <circle cx="-12" cy="4" r="13" fill="#E2E8F0"/>
            <circle cx="0" cy="2" r="5" fill="#475569"/>
          </g>`,
        portrait: `
          <!-- Mohammad Hoesni Thamrin Authentic Portrait -->
          <g transform="translate(215, 22)">
            <!-- Blazer & Shoulders -->
            <path d="M10 108 L16 74 C18 65 64 65 66 74 L72 108 Z" fill="#1E293B"/>
            <!-- White Dress Shirt Winged Collar & Bow/Tie -->
            <polygon points="31,66 41,85 51,66" fill="#F8FAFC"/>
            <polygon points="39,70 43,70 44,94 38,94" fill="#334155"/>
            <path d="M28 66 L36 86 L41 85 M54 66 L46 86 L41 85" stroke="#0F172A" stroke-width="1.2" fill="none"/>
            <!-- Neck -->
            <rect x="34" y="54" width="14" height="14" rx="4" fill="#BCC6D4"/>
            <!-- Face -->
            <ellipse cx="41" cy="40" rx="14.5" ry="18" fill="#CBD5E1" stroke="#334155" stroke-width="0.7"/>
            <!-- Classic Black Velvet Peci -->
            <path d="M24 27 L27 12 C28 10 54 10 55 12 L58 27 C49 24 33 24 24 27 Z" fill="#0F172A" stroke="#334155" stroke-width="0.7"/>
            <path d="M26 24 Q41 21 56 24" stroke="#475569" stroke-width="0.8" fill="none"/>
            <!-- Ears -->
            <ellipse cx="26" cy="41" rx="2.2" ry="4" fill="#94A3B8"/>
            <ellipse cx="56" cy="41" rx="2.2" ry="4" fill="#94A3B8"/>
            <!-- Brows, Eyes, Dignified Moustache Hint -->
            <path d="M32 35.5 Q35.5 34 38.5 35.5 M43.5 35.5 Q46.5 34 50 35.5" stroke="#1E293B" stroke-width="1.2" fill="none"/>
            <ellipse cx="35.5" cy="38.5" rx="2" ry="1.2" fill="#0F172A"/>
            <ellipse cx="46.5" cy="38.5" rx="2" ry="1.2" fill="#0F172A"/>
            <path d="M41 37 L40 44.5 L42.5 45.5" stroke="#475569" stroke-width="0.9" fill="none"/>
            <path d="M36 48 Q41 46.5 46 48" stroke="#334155" stroke-width="1.2" fill="none" opacity="0.75"/>
            <path d="M37 51 Q41 52.5 45 51" stroke="#334155" stroke-width="0.9" fill="none"/>
          </g>`
      },
      5000: {
        num: "5000",
        label: "Rp5.000",
        name: "Lima Ribu Rupiah",
        hero: "Dr. K.H. Idham Chalid",
        spelled: "LIMA RIBU RUPIAH",
        serial: "KHC 202205",
        c1: "#92400E", c2: "#D97706", c3: "#FDE68A", dark: "#451A03", skin: "#F3D3A3", accent: "#F59E0B",
        flower: `
          <g opacity="0.25" transform="translate(115, 76)">
            <path d="M0 -22 C8 -10 8 10 0 22 C-8 10 -8 -10 0 -22 Z" fill="#FFFFFF"/>
            <path d="M-22 0 C-10 -8 10 -8 22 0 C10 8 -10 8 -22 0 Z" fill="#FEF3C7"/>
            <circle cx="0" cy="0" r="5" fill="#78350F"/>
          </g>`,
        portrait: `
          <!-- Dr. K.H. Idham Chalid Authentic Portrait -->
          <g transform="translate(215, 22)">
            <!-- Formal Coat & Traditional Scarf Sash -->
            <path d="M10 108 L15 74 C17 65 65 65 67 74 L72 108 Z" fill="#451A03"/>
            <path d="M26 67 L35 108 L47 108 L56 67 Z" fill="#78350F"/>
            <polygon points="33,66 41,84 49,66" fill="#FEF3C7"/>
            <polygon points="39.5,69 42.5,69 43,96 39,96" fill="#92400E"/>
            <!-- Neck & Face -->
            <rect x="34" y="54" width="14" height="14" rx="4" fill="#D9AE73"/>
            <ellipse cx="41" cy="40" rx="14.5" ry="18" fill="#EAC895" stroke="#78350F" stroke-width="0.7"/>
            <!-- Peci -->
            <path d="M24 27 L27 12 C28 10 54 10 55 12 L58 27 C49 24 33 24 24 27 Z" fill="#291202"/>
            <!-- Ears -->
            <ellipse cx="26" cy="41" rx="2.2" ry="4" fill="#C79B5E"/>
            <ellipse cx="56" cy="41" rx="2.2" ry="4" fill="#C79B5E"/>
            <!-- Distinguished Glasses -->
            <rect x="29.5" y="34.5" width="9.5" height="6.8" rx="2" fill="rgba(255,255,255,0.22)" stroke="#291202" stroke-width="1.15"/>
            <rect x="43" y="34.5" width="9.5" height="6.8" rx="2" fill="rgba(255,255,255,0.22)" stroke="#291202" stroke-width="1.15"/>
            <line x1="39" y1="37.5" x2="43" y2="37.5" stroke="#291202" stroke-width="1.15"/>
            <circle cx="34.2" cy="38" r="1.4" fill="#291202"/>
            <circle cx="47.8" cy="38" r="1.4" fill="#291202"/>
            <!-- Nose & Calm Smile -->
            <path d="M41 37.5 L40 44.5 L42.5 45.5" stroke="#92400E" stroke-width="0.9" fill="none"/>
            <path d="M36 50.5 Q41 53.5 46 50.5" stroke="#78350F" stroke-width="1" fill="none" stroke-linecap="round"/>
          </g>`
      },
      10000: {
        num: "10000",
        label: "Rp10.000",
        name: "Sepuluh Ribu Rupiah",
        hero: "Frans Kaisiepo",
        spelled: "SEPULUH RIBU RUPIAH",
        serial: "FKS 202210",
        c1: "#6B21A8", c2: "#A855F7", c3: "#F3E8FF", dark: "#3B0764", skin: "#D8B4FE", accent: "#C084FC",
        flower: `
          <g opacity="0.25" transform="translate(115, 76)">
            <ellipse cx="0" cy="-12" rx="9" ry="16" fill="#FFFFFF"/>
            <ellipse cx="14" cy="4" rx="9" ry="15" fill="#F5D0FE" transform="rotate(60)"/>
            <ellipse cx="-14" cy="4" rx="9" ry="15" fill="#F5D0FE" transform="rotate(-60)"/>
            <circle cx="0" cy="0" r="5" fill="#581C87"/>
          </g>`,
        portrait: `
          <!-- Frans Kaisiepo Authentic Portrait -->
          <g transform="translate(215, 22)">
            <path d="M10 108 L15 74 C17 65 65 65 67 74 L72 108 Z" fill="#2E1065"/>
            <polygon points="32,66 41,85 50,66" fill="#FAF5FF"/>
            <polygon points="39,69 43,69 44,95 38,95" fill="#6B21A8"/>
            <rect x="34" y="54" width="14" height="14" rx="4" fill="#C4B5FD"/>
            <!-- Curly Textured Hair -->
            <path d="M23 36 C21 20 30 12 41 12 C52 12 61 20 59 36 C56 26 26 26 23 36 Z" fill="#2E1065"/>
            <circle cx="29" cy="20" r="4" fill="#2E1065"/>
            <circle cx="41" cy="17" r="4.5" fill="#2E1065"/>
            <circle cx="53" cy="20" r="4" fill="#2E1065"/>
            <!-- Strong Face Contours -->
            <ellipse cx="41" cy="40" rx="14.5" ry="18" fill="#D8B4FE" stroke="#4C1D95" stroke-width="0.7"/>
            <ellipse cx="26" cy="41" rx="2.2" ry="4" fill="#A78BFA"/>
            <ellipse cx="56" cy="41" rx="2.2" ry="4" fill="#A78BFA"/>
            <!-- Features -->
            <path d="M32 35 Q35.5 33.5 38.5 35 M43.5 35 Q46.5 33.5 50 35" stroke="#2E1065" stroke-width="1.2" fill="none"/>
            <ellipse cx="35.5" cy="38.5" rx="2.1" ry="1.2" fill="#1E1B4B"/>
            <ellipse cx="46.5" cy="38.5" rx="2.1" ry="1.2" fill="#1E1B4B"/>
            <path d="M41 37 L40 45 L43 46" stroke="#581C87" stroke-width="1" fill="none"/>
            <path d="M36 51 Q41 53.5 46 51" stroke="#4C1D95" stroke-width="1.1" fill="none" stroke-linecap="round"/>
          </g>`
      },
      20000: {
        num: "20000",
        label: "Rp20.000",
        name: "Dua Puluh Ribu Rupiah",
        hero: "Dr. G.S.S.J. Ratulangi",
        spelled: "DUA PULUH RIBU RUPIAH",
        serial: "GSR 202220",
        c1: "#065F46", c2: "#10B981", c3: "#D1FAE5", dark: "#022C22", skin: "#A7F3D0", accent: "#34D399",
        flower: `
          <g opacity="0.25" transform="translate(115, 76)">
            <ellipse cx="0" cy="0" rx="18" ry="12" fill="#FFFFFF" transform="rotate(20)"/>
            <ellipse cx="0" cy="0" rx="18" ry="12" fill="#ECFDF5" transform="rotate(-40)"/>
            <circle cx="0" cy="0" r="5" fill="#065F46"/>
          </g>`,
        portrait: `
          <!-- Dr. G.S.S.J. Ratulangi Authentic Portrait -->
          <g transform="translate(215, 22)">
            <path d="M10 108 L15 74 C17 65 65 65 67 74 L72 108 Z" fill="#064E3B"/>
            <polygon points="32,66 41,85 50,66" fill="#ECFDF5"/>
            <polygon points="39,69 43,69 44,95 38,95" fill="#047857"/>
            <rect x="34" y="54" width="14" height="14" rx="4" fill="#6EE7B7"/>
            <!-- Neat Side-Parted Hair -->
            <path d="M25 35 C24 18 32 13 42 13 C52 13 58 19 57 35 C52 24 32 24 25 35 Z" fill="#022C22"/>
            <path d="M29 19 Q41 16 53 20" stroke="#A7F3D0" stroke-width="0.9" fill="none" opacity="0.6"/>
            <!-- Face -->
            <ellipse cx="41" cy="40" rx="14.5" ry="18" fill="#A7F3D0" stroke="#065F46" stroke-width="0.7"/>
            <ellipse cx="26" cy="41" rx="2.2" ry="4" fill="#6EE7B7"/>
            <ellipse cx="56" cy="41" rx="2.2" ry="4" fill="#6EE7B7"/>
            <!-- Features -->
            <path d="M32 35 Q35.5 33.5 38.5 35 M43.5 35 Q46.5 33.5 50 35" stroke="#022C22" stroke-width="1.15" fill="none"/>
            <ellipse cx="35.5" cy="38.5" rx="2" ry="1.2" fill="#022C22"/>
            <ellipse cx="46.5" cy="38.5" rx="2" ry="1.2" fill="#022C22"/>
            <path d="M41 37 L40 44.5 L42.5 45.5" stroke="#065F46" stroke-width="0.95" fill="none"/>
            <path d="M36.5 51 Q41 53 45.5 51" stroke="#064E3B" stroke-width="1" fill="none" stroke-linecap="round"/>
          </g>`
      },
      50000: {
        num: "50000",
        label: "Rp50.000",
        name: "Lima Puluh Ribu Rupiah",
        hero: "Ir. H. Djuanda Kartawidjaja",
        spelled: "LIMA PULUH RIBU RUPIAH",
        serial: "IHD 202250",
        c1: "#0369A1", c2: "#0EA5E9", c3: "#BAE6FD", dark: "#0C4A6E", skin: "#BAE6FD", accent: "#38BDF8",
        flower: `
          <g opacity="0.25" transform="translate(115, 76)">
            <circle cx="0" cy="-10" r="10" fill="#FFFFFF"/>
            <circle cx="10" cy="3" r="10" fill="#E0F2FE"/>
            <circle cx="-10" cy="3" r="10" fill="#E0F2FE"/>
            <circle cx="0" cy="0" r="4" fill="#0284C7"/>
          </g>`,
        portrait: `
          <!-- Ir. H. Djuanda Authentic Portrait -->
          <g transform="translate(215, 22)">
            <path d="M10 108 L15 74 C17 65 65 65 67 74 L72 108 Z" fill="#0C4A6E"/>
            <polygon points="32,66 41,85 50,66" fill="#F0F9FF"/>
            <polygon points="39,69 43,69 44,95 38,95" fill="#0284C7"/>
            <rect x="34" y="54" width="14" height="14" rx="4" fill="#7DD3FC"/>
            <!-- Neat Swept Hair -->
            <path d="M25 34 C25 18 33 13 41 13 C50 13 57 18 57 34 C51 23 31 23 25 34 Z" fill="#082F49"/>
            <!-- Face -->
            <ellipse cx="41" cy="40" rx="14.5" ry="18" fill="#BAE6FD" stroke="#0369A1" stroke-width="0.7"/>
            <ellipse cx="26" cy="41" rx="2.2" ry="4" fill="#7DD3FC"/>
            <ellipse cx="56" cy="41" rx="2.2" ry="4" fill="#7DD3FC"/>
            <!-- Signature Round Spectacles -->
            <circle cx="34.5" cy="38.5" r="4.5" fill="rgba(255,255,255,0.28)" stroke="#082F49" stroke-width="1.2"/>
            <circle cx="47.5" cy="38.5" r="4.5" fill="rgba(255,255,255,0.28)" stroke="#082F49" stroke-width="1.2"/>
            <line x1="39" y1="38.5" x2="43" y2="38.5" stroke="#082F49" stroke-width="1.2"/>
            <circle cx="34.5" cy="38.5" r="1.4" fill="#082F49"/>
            <circle cx="47.5" cy="38.5" r="1.4" fill="#082F49"/>
            <!-- Nose & Gentle Smile -->
            <path d="M41 38 L40 44.5 L42.5 45.5" stroke="#0369A1" stroke-width="0.95" fill="none"/>
            <path d="M36 50.5 Q41 53.5 46 50.5" stroke="#0C4A6E" stroke-width="1" fill="none" stroke-linecap="round"/>
          </g>`
      },
      100000: {
        num: "100000",
        label: "Rp100.000",
        name: "Seratus Ribu Rupiah",
        hero: "Ir. Soekarno & Drs. M. Hatta",
        spelled: "SERATUS RIBU RUPIAH",
        serial: "SHB 2022100",
        c1: "#BE123C", c2: "#FB7185", c3: "#FFE4E6", dark: "#881337", skin: "#FECDD3", accent: "#F43F5E",
        flower: `
          <g opacity="0.25" transform="translate(115, 76)">
            <circle cx="0" cy="-12" r="10" fill="#FFFFFF"/>
            <circle cx="11" cy="2" r="10" fill="#FFE4E6"/>
            <circle cx="-11" cy="2" r="10" fill="#FFE4E6"/>
            <circle cx="0" cy="-2" r="5" fill="#9F1239"/>
          </g>`,
        portrait: `
          <!-- Duo Proklamator Ir. Soekarno & Drs. M. Hatta Authentic Engraved Portraits -->
          <g transform="translate(198, 25)">
            <!-- 1. Bung Karno (Left) -->
            <g transform="translate(0, 0)">
              <path d="M4 104 L8 72 C10 64 44 64 46 72 L50 104 Z" fill="#881337"/>
              <polygon points="20,66 27,82 34,66" fill="#FFF1F2"/>
              <polygon points="25.5,69 28.5,69 29,92 25,92" fill="#4C0519"/>
              <rect x="21.5" y="52" width="11" height="14" rx="3" fill="#FDA4AF"/>
              <ellipse cx="27" cy="39" rx="12" ry="15" fill="#FECDD3" stroke="#9F1239" stroke-width="0.65"/>
              <!-- Iconic Black Peci -->
              <path d="M13 28 L16 14 C17 12 37 12 38 14 L41 28 C33 25 21 25 13 28 Z" fill="#1E050D"/>
              <path d="M19 35.5 Q22 34 25 35.5 M29 35.5 Q32 34 35 35.5" stroke="#4C0519" stroke-width="1" fill="none"/>
              <ellipse cx="22" cy="38" rx="1.7" ry="1" fill="#1E050D"/>
              <ellipse cx="32" cy="38" rx="1.7" ry="1" fill="#1E050D"/>
              <path d="M27 37 L26 43.5 L28 44.2" stroke="#9F1239" stroke-width="0.8" fill="none"/>
              <path d="M22.5 48.5 Q27 50.5 31.5 48.5" stroke="#881337" stroke-width="0.9" fill="none"/>
            </g>
            <!-- 2. Bung Hatta (Right) -->
            <g transform="translate(46, 2)">
              <path d="M4 102 L8 70 C10 62 44 62 46 70 L50 102 Z" fill="#4C0519"/>
              <polygon points="20,64 27,80 34,64" fill="#FFF1F2"/>
              <polygon points="25.5,67 28.5,67 29,90 25,90" fill="#9F1239"/>
              <rect x="21.5" y="50" width="11" height="14" rx="3" fill="#FDA4AF"/>
              <ellipse cx="27" cy="37" rx="11.5" ry="14.5" fill="#FECDD3" stroke="#9F1239" stroke-width="0.65"/>
              <!-- Black Peci -->
              <path d="M14 26 L17 12 C18 10 36 10 37 12 L40 26 C32 23 22 23 14 26 Z" fill="#1E050D"/>
              <!-- Classic Round Glasses -->
              <circle cx="22" cy="36.5" r="3.5" fill="rgba(255,255,255,0.25)" stroke="#1E050D" stroke-width="1"/>
              <circle cx="32" cy="36.5" r="3.5" fill="rgba(255,255,255,0.25)" stroke="#1E050D" stroke-width="1"/>
              <line x1="25.5" y1="36.5" x2="28.5" y2="36.5" stroke="#1E050D" stroke-width="1"/>
              <circle cx="22" cy="36.5" r="1.2" fill="#1E050D"/>
              <circle cx="32" cy="36.5" r="1.2" fill="#1E050D"/>
              <path d="M27 36 L26 42 L28 43" stroke="#9F1239" stroke-width="0.8" fill="none"/>
              <path d="M23 47 Q27 48.5 31 47" stroke="#881337" stroke-width="0.9" fill="none"/>
            </g>
          </g>`
      }
    }[v] || {
      num: String(val), label: `Rp${val}`, name: "Uang Kertas", hero: "Pahlawan Nasional",
      spelled: "RUPIAH", serial: "IND 202200", c1: "#334155", c2: "#64748B", c3: "#CBD5E1", dark: "#1E293B", skin: "#CBD5E1", accent: "#94A3B8",
      flower: '', portrait: '<circle cx="245" cy="65" r="18" fill="#1E293B"/>'
    };

    return `
      <svg class="${cls} transition-transform group-hover:scale-102" viewBox="0 0 320 152" fill="none">
        <defs>
          <!-- Banknote Intaglio Body Gradient -->
          <linearGradient id="noteGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stop-color="${data.c1}"/>
            <stop offset="48%" stop-color="${data.c2}"/>
            <stop offset="85%" stop-color="${data.c3}"/>
            <stop offset="100%" stop-color="${data.c2}"/>
          </linearGradient>

          <!-- Pale Cream Paper Watermark Window -->
          <linearGradient id="wmGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.92"/>
            <stop offset="70%" stop-color="#FFFDF8" stop-opacity="0.72"/>
            <stop offset="100%" stop-color="#FFFDF8" stop-opacity="0.0"/>
          </linearGradient>

          <!-- OVI Metallic Color-Shift Shield -->
          <linearGradient id="oviGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B"/>
            <stop offset="50%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#EC4899"/>
          </linearGradient>

          <!-- Woven Hologram Thread Gradient -->
          <linearGradient id="holo_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FCD34D"/>
            <stop offset="25%" stop-color="#34D399"/>
            <stop offset="50%" stop-color="#60A5FA"/>
            <stop offset="75%" stop-color="#F472B6"/>
            <stop offset="100%" stop-color="#FBBF24"/>
          </linearGradient>

          <clipPath id="noteClip_${uid}">
            <rect x="8" y="7" width="304" height="138" rx="4"/>
          </clipPath>
        </defs>

        <!-- Cream Cotton Paper Substrate Border (Authentic Rupiah Edge) -->
        <rect x="2" y="2" width="316" height="148" rx="6" fill="#FAF7EF" stroke="#CBD5E1" stroke-width="1.2"/>

        <!-- Printed Intaglio Body Area -->
        <g clip-path="url(#noteClip_${uid})">
          <rect x="8" y="7" width="304" height="138" fill="url(#noteGrad_${uid})"/>

          <!-- Left-side Watermark Oval Substrate -->
          <rect x="8" y="7" width="88" height="138" fill="url(#wmGrad_${uid})"/>

          <!-- Translucent Watermark Portrait Silhouette -->
          <g opacity="0.16" fill="${data.dark}">
            <ellipse cx="48" cy="72" rx="16" ry="20"/>
            <path d="M26 118 C26 96 70 96 70 118 Z"/>
          </g>
          <text x="48" y="106" font-size="8" font-weight="900" fill="${data.dark}" opacity="0.22" text-anchor="middle" letter-spacing="1.5">BI</text>

          <!-- Guilloche Engraved Filigree Curves & Mandala -->
          <circle cx="155" cy="76" r="46" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-dasharray="3 2"/>
          <circle cx="155" cy="76" r="36" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
          <path d="M 8 34 Q 80 14 160 34 T 312 34" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" fill="none"/>
          <path d="M 8 118 Q 80 138 160 118 T 312 118" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" fill="none"/>

          <!-- Floral Motifs -->
          <g transform="translate(36, 10)">
            ${data.flower}
          </g>

          <!-- Pale Highlight Backing behind Hero Portrait -->
          <ellipse cx="256" cy="78" rx="46" ry="56" fill="rgba(255,255,255,0.34)"/>

          <!-- Woven Segmented Metallic Security Thread (Benang Pengaman TE 2022) -->
          <g>
            <rect x="118" y="7" width="7" height="26" fill="url(#holo_${uid})" rx="1"/>
            <rect x="118" y="45" width="7" height="24" fill="url(#holo_${uid})" rx="1"/>
            <rect x="118" y="81" width="7" height="24" fill="url(#holo_${uid})" rx="1"/>
            <rect x="118" y="117" width="7" height="28" fill="url(#holo_${uid})" rx="1"/>
            <text x="121.5" y="61" font-size="3.8" font-weight="900" fill="#1E293B" text-anchor="middle" transform="rotate(90 121.5 61)">BI ${data.num}</text>
          </g>

          <!-- Realistic Garuda Pancasila Coat of Arms Top-Left -->
          <g transform="translate(15, 13)">
            <path d="M10 1 L13.5 6 L19 5 L15.5 10.5 L18 16 L10 14 L2 16 L4.5 10.5 L1 5 L6.5 6 Z" fill="#FBBF24" stroke="#92400E" stroke-width="0.9"/>
            <polygon points="10,6 13,9 10,13 7,9" fill="#EF4444" stroke="#FFFFFF" stroke-width="0.6"/>
          </g>

          <!-- Official Header Typography -->
          <text x="38" y="20" font-size="5.5" font-weight="900" font-family="'Arial', sans-serif" fill="${data.dark}" letter-spacing="0.4">NEGARA KESATUAN REPUBLIK INDONESIA</text>
          <text x="38" y="30" font-size="9" font-weight="900" font-family="'Arial Black', sans-serif" fill="${data.dark}" letter-spacing="0.8">BANK INDONESIA</text>

          <!-- Optical Variable Ink (OVI) Metallic Color-Shift Flower Badge -->
          <g transform="translate(148, 52)">
            <circle cx="0" cy="0" r="9.5" fill="url(#oviGrad_${uid})" stroke="#FFFFFF" stroke-width="0.8" opacity="0.9"/>
            <circle cx="0" cy="0" r="4.5" fill="#FEF08A" opacity="0.8"/>
          </g>

          <!-- Authentic Hero Portrait -->
          ${data.portrait}

          <!-- Top-Right Large Intaglio Nominal -->
          <text x="303" y="29" font-size="18" font-weight="900" font-family="'Fredoka', 'Arial Black', sans-serif" fill="${data.dark}" text-anchor="end" opacity="0.28">${data.num}</text>
          <text x="302" y="28" font-size="18" font-weight="900" font-family="'Fredoka', 'Arial Black', sans-serif" fill="#FFFFFF" text-anchor="end">${data.num}</text>

          <!-- Bottom-Left Main Nominal & Spelled Text -->
          <text x="16" y="75" font-size="22" font-weight="900" font-family="'Fredoka', 'Arial Black', sans-serif" fill="${data.dark}" opacity="0.32">${data.num}</text>
          <text x="15" y="74" font-size="22" font-weight="900" font-family="'Fredoka', 'Arial Black', sans-serif" fill="#FFFFFF">${data.num}</text>

          <text x="15" y="90" font-size="6.8" font-weight="900" font-family="'Arial', sans-serif" fill="${data.dark}" letter-spacing="0.6">${data.spelled}</text>
          <text x="15" y="100" font-size="5" font-weight="800" fill="${data.dark}" opacity="0.78">EMISI 2022</text>

          <!-- Banknote Serial Number in Red Ink -->
          <text x="15" y="136" font-size="6.8" font-weight="bold" font-family="'Courier New', monospace" fill="#B91C1C" letter-spacing="0.8">${data.serial}</text>

          <!-- Hero Name Label Ribbon -->
          <rect x="190" y="127" width="114" height="13" rx="3" fill="rgba(15,23,42,0.68)"/>
          <text x="247" y="136" font-size="5.6" font-weight="bold" font-family="'Arial', sans-serif" fill="#FFFFFF" text-anchor="middle">${data.hero}</text>

          <!-- Tactile Blind-Code Raised Edge Bars (Left & Right) -->
          <g fill="${data.dark}" opacity="0.65">
            <rect x="9" y="42" width="3" height="2" rx="0.5"/>
            <rect x="9" y="47" width="3" height="2" rx="0.5"/>
            <rect x="9" y="52" width="3" height="2" rx="0.5"/>
            <rect x="308" y="42" width="3" height="2" rx="0.5"/>
            <rect x="308" y="47" width="3" height="2" rx="0.5"/>
            <rect x="308" y="52" width="3" height="2" rx="0.5"/>
          </g>
        </g>
      </svg>`;
  },

  // UPI Cibiru Official Logo
  upiLogo: (cls = "w-12 h-12") => `
    <div class="${cls} rounded-full bg-white p-1.5 shadow-md border-2 border-red-200 ring-2 ring-amber-200/60 inline-flex items-center justify-center flex-shrink-0">
      <img src="assets/images/logo.png" alt="Logo UPI" class="w-full h-full object-contain" />
    </div>`
};

window.RBC_ICONS = RBC_ICONS;
