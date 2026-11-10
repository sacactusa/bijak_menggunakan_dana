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

  // Ilustrasi Uang Logam (Koin) Mirip Uang Asli Indonesia
  rupiahCoin: (val, cls = "w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md") => {
    const v = parseInt(val, 10);
    const is1000 = (v === 1000);
    const labels = {
      100: { num: "100", sub: "BURUNG KAKAKTUA", year: "2016" },
      200: { num: "200", sub: "JALAK BALI", year: "2016" },
      500: { num: "500", sub: "BUNGA MELATI", year: "2016" },
      1000: { num: "1000", sub: "MR. I GUSTI KETUT PUDJA", year: "2016" }
    }[v] || { num: String(val), sub: "RUPIAH", year: "2016" };

    const gradId = `coin_grad_${v}`;
    const rimId = `rim_grad_${v}`;
    const filterId = `emboss_${v}`;

    return `
      <svg class="${cls} transition-transform group-hover:scale-105" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="${gradId}" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="40%" stop-color="${is1000 ? '#E2E8F0' : '#F1F5F9'}"/>
            <stop offset="85%" stop-color="${is1000 ? '#94A3B8' : '#CBD5E1'}"/>
            <stop offset="100%" stop-color="#64748B"/>
          </radialGradient>
          <linearGradient id="${rimId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="50%" stop-color="#94A3B8"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
          <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" flood-color="#FFFFFF" flood-opacity="0.9"/>
            <feDropShadow dx="-1" dy="-1" stdDeviation="0.8" flood-color="#1E293B" flood-opacity="0.6"/>
          </filter>
        </defs>

        <!-- Tepian Bergerigi Logam -->
        <circle cx="50" cy="50" r="48" fill="url(#${rimId})" stroke="#475569" stroke-width="1.5"/>
        <circle cx="50" cy="50" r="45" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="2 1.5"/>
        <circle cx="50" cy="50" r="43" fill="url(#${gradId})"/>
        ${is1000 ? '<circle cx="50" cy="50" r="33" fill="none" stroke="#64748B" stroke-width="1.2" stroke-dasharray="3 2"/>' : ''}

        <!-- Teks Lengkung Atas BANK INDONESIA -->
        <path id="arcTop_${v}" d="M 22 50 A 28 28 0 0 1 78 50" fill="none"/>
        <text font-size="6" font-weight="900" fill="#334155" letter-spacing="1">
          <textPath href="#arcTop_${v}" startOffset="50%" text-anchor="middle">BANK INDONESIA</textPath>
        </text>

        <!-- Angka Nominal Besar Timbul -->
        <text x="50" y="${is1000 ? 54 : 56}" font-size="${is1000 ? 19 : 23}" font-weight="900" font-family="'Fredoka', sans-serif" fill="#1E293B" text-anchor="middle" filter="url(#${filterId})">
          ${labels.num}
        </text>

        <!-- Teks Bawah RUPIAH & Keterangan Gambar -->
        <path id="arcBot_${v}" d="M 24 55 A 27 27 0 0 0 76 55" fill="none"/>
        <text font-size="5.5" font-weight="800" fill="#475569" letter-spacing="1">
          <textPath href="#arcBot_${v}" startOffset="50%" text-anchor="middle">RUPIAH</textPath>
        </text>
        <text x="50" y="78" font-size="4" font-weight="bold" fill="#64748B" text-anchor="middle">
          ${labels.sub}
        </text>
        <text x="50" y="86" font-size="3.5" font-weight="bold" fill="#94A3B8" text-anchor="middle">
          EMISI ${labels.year}
        </text>
      </svg>`;
  },

  // Ilustrasi Uang Kertas Mirip Uang Asli Indonesia (Seri TE 2022)
  rupiahBanknote: (val, cls = "w-full h-auto drop-shadow-md") => {
    const v = parseInt(val, 10);
    const data = {
      1000: {
        num: "1000",
        label: "Rp1.000",
        name: "Seribu Rupiah Kertas",
        hero: "Tjut Meutia",
        spelled: "SERIBU RUPIAH",
        c1: "#4D5D1C", c2: "#86992E", c3: "#D5E370", border: "#3B4715",
        portrait: `
          <!-- Tjut Meutia Sanggul & Profil -->
          <circle cx="188" cy="44" r="14" fill="#3B4715"/>
          <path d="M196 32 C204 36 204 46 198 48 C198 40 192 34 196 32 Z" fill="#2E3710"/>
          <path d="M174 58 C174 48 202 48 202 58 L206 92 L170 92 Z" fill="#2E3710"/>
          <path d="M178 68 L188 80 L198 68" stroke="#D5E370" stroke-width="1.5" fill="none"/>
        `
      },
      2000: {
        num: "2000",
        label: "Rp2.000",
        name: "Dua Ribu Rupiah",
        hero: "Mohammad Hoesni Thamrin",
        spelled: "DUA RIBU RUPIAH",
        c1: "#334155", c2: "#64748B", c3: "#CBD5E1", border: "#1E293B",
        portrait: `
          <!-- M.H. Thamrin Peci & Profil -->
          <path d="M174 34 L202 34 L199 43 L177 43 Z" fill="#0F172A"/>
          <circle cx="188" cy="50" r="13" fill="#1E293B"/>
          <path d="M173 62 C173 52 203 52 203 62 L207 92 L169 92 Z" fill="#0F172A"/>
          <polygon points="188,64 185,76 191,76" fill="#FFFFFF"/>
        `
      },
      5000: {
        num: "5000",
        label: "Rp5.000",
        name: "Lima Ribu Rupiah",
        hero: "Dr. K.H. Idham Chalid",
        spelled: "LIMA RIBU RUPIAH",
        c1: "#78350F", c2: "#B45309", c3: "#FDE68A", border: "#451A03",
        portrait: `
          <!-- Idham Chalid Peci & Kacamata -->
          <path d="M174 34 L202 34 L199 43 L177 43 Z" fill="#451A03"/>
          <circle cx="188" cy="50" r="13" fill="#78350F"/>
          <circle cx="184" cy="49" r="2.8" fill="none" stroke="#FDE68A" stroke-width="1"/>
          <circle cx="192" cy="49" r="2.8" fill="none" stroke="#FDE68A" stroke-width="1"/>
          <path d="M173 62 C173 52 203 52 203 62 L207 92 L169 92 Z" fill="#451A03"/>
          <polygon points="188,64 186,80 190,80" fill="#FDE68A"/>
        `
      },
      10000: {
        num: "10000",
        label: "Rp10.000",
        name: "Sepuluh Ribu Rupiah",
        hero: "Frans Kaisiepo",
        spelled: "SEPULUH RIBU RUPIAH",
        c1: "#581C87", c2: "#9333EA", c3: "#E9D5FF", border: "#3B0764",
        portrait: `
          <!-- Frans Kaisiepo Profil Wibawa -->
          <circle cx="188" cy="48" r="14" fill="#3B0764"/>
          <path d="M174 37 C178 33 198 33 202 37" stroke="#E9D5FF" stroke-width="1.5" fill="none"/>
          <path d="M173 62 C173 52 203 52 203 62 L207 92 L169 92 Z" fill="#2E1065"/>
          <path d="M182 64 L188 78 L194 64" fill="#E9D5FF"/>
        `
      },
      20000: {
        num: "20000",
        label: "Rp20.000",
        name: "Dua Puluh Ribu Rupiah",
        hero: "Dr. G.S.S.J. Ratulangi",
        spelled: "DUA PULUH RIBU RUPIAH",
        c1: "#14532D", c2: "#16A34A", c3: "#86EFAC", border: "#052E16",
        portrait: `
          <!-- Sam Ratulangi Rambut Belah Samping & Jas -->
          <circle cx="188" cy="48" r="14" fill="#052E16"/>
          <path d="M175 39 C180 34 195 34 201 41" fill="#02200F"/>
          <path d="M173 62 C173 52 203 52 203 62 L207 92 L169 92 Z" fill="#02200F"/>
          <polygon points="188,64 184,78 192,78" fill="#86EFAC"/>
        `
      },
      50000: {
        num: "50000",
        label: "Rp50.000",
        name: "Lima Puluh Ribu Rupiah",
        hero: "Ir. H. Djuanda Kartawidjaja",
        spelled: "LIMA PULUH RIBU RUPIAH",
        c1: "#1E3A8A", c2: "#2563EB", c3: "#93C5FD", border: "#172554",
        portrait: `
          <!-- Ir. H. Djuanda Kacamata & Jas Formal -->
          <circle cx="188" cy="48" r="14" fill="#172554"/>
          <circle cx="184" cy="47" r="3" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
          <circle cx="192" cy="47" r="3" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
          <line x1="187" y1="47" x2="189" y2="47" stroke="#FFFFFF" stroke-width="1.2"/>
          <path d="M173 62 C173 52 203 52 203 62 L207 92 L169 92 Z" fill="#0F172A"/>
          <path d="M183 63 L188 77 L193 63" fill="#93C5FD"/>
        `
      },
      100000: {
        num: "100000",
        label: "Rp100.000",
        name: "Seratus Ribu Rupiah",
        hero: "Soekarno - Hatta",
        spelled: "SERATUS RIBU RUPIAH",
        c1: "#881337", c2: "#E11D48", c3: "#FDA4AF", border: "#4C0519",
        portrait: `
          <!-- Duo Proklamator Bung Karno & Bung Hatta -->
          <!-- Bung Karno (Kiri) Peci Hitam -->
          <path d="M164 34 L184 34 L182 42 L166 42 Z" fill="#000000"/>
          <circle cx="174" cy="48" r="10.5" fill="#4C0519"/>
          <path d="M162 59 C162 52 186 52 186 59 L188 92 L160 92 Z" fill="#4C0519"/>
          <!-- Bung Hatta (Kanan) Peci & Kacamata -->
          <path d="M190 35 L210 35 L208 43 L192 43 Z" fill="#000000"/>
          <circle cx="200" cy="49" r="10.5" fill="#881337"/>
          <circle cx="197" cy="48" r="2.2" fill="none" stroke="#FFFFFF" stroke-width="1"/>
          <circle cx="203" cy="48" r="2.2" fill="none" stroke="#FFFFFF" stroke-width="1"/>
          <path d="M188 60 C188 53 212 53 212 60 L214 92 L186 92 Z" fill="#4C0519"/>
        `
      }
    }[v] || {
      num: String(val), label: `Rp${val}`, name: "Uang Kertas", hero: "Pahlawan Nasional",
      spelled: "RUPIAH", c1: "#334155", c2: "#64748B", c3: "#CBD5E1", border: "#1E293B",
      portrait: '<circle cx="188" cy="48" r="14" fill="#1E293B"/>'
    };

    const gradId = `note_grad_${v}`;
    const holoId = `holo_grad_${v}`;

    return `
      <svg class="${cls} transition-transform group-hover:scale-102" viewBox="0 0 240 115" fill="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${data.c1}"/>
            <stop offset="50%" stop-color="${data.c2}"/>
            <stop offset="100%" stop-color="${data.c3}"/>
          </linearGradient>
          <linearGradient id="${holoId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FCD34D" stop-opacity="0.9"/>
            <stop offset="35%" stop-color="#34D399" stop-opacity="0.8"/>
            <stop offset="70%" stop-color="#60A5FA" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#F472B6" stop-opacity="0.9"/>
          </linearGradient>
        </defs>

        <!-- Dasar Uang Kertas Realistis -->
        <rect x="2" y="2" width="236" height="111" rx="8" fill="url(#${gradId})" stroke="${data.border}" stroke-width="2.5"/>
        <rect x="6" y="6" width="228" height="103" rx="6" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="3 2"/>

        <!-- Pola Pengaman Guilloche Halus -->
        <path d="M 6 30 Q 60 15 120 30 T 234 30 M 6 85 Q 60 100 120 85 T 234 85" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" fill="none"/>
        <circle cx="188" cy="56" r="38" fill="rgba(255,255,255,0.18)"/>

        <!-- Benang Pengaman Hologram Vertikal -->
        <rect x="62" y="2" width="9" height="111" fill="url(#${holoId})"/>
        <text x="66.5" y="40" font-size="5" font-weight="900" fill="#1E293B" transform="rotate(90 66.5 40)">BI ${data.num}</text>
        <text x="66.5" y="85" font-size="5" font-weight="900" fill="#1E293B" transform="rotate(90 66.5 85)">BI ${data.num}</text>

        <!-- Teks Header NKRI & Bank Indonesia -->
        <text x="14" y="16" font-size="4.2" font-weight="800" fill="rgba(255,255,255,0.9)" letter-spacing="0.5">NEGARA KESATUAN REPUBLIK INDONESIA</text>
        <text x="14" y="27" font-size="8.5" font-weight="900" fill="#FFFFFF" letter-spacing="1">BANK INDONESIA</text>

        <!-- Lambang Garuda Pancasila Emas -->
        <g transform="translate(14, 34) scale(0.65)">
          <path d="M10 2 L14 10 L22 11 L16 16 L18 24 L10 20 L2 24 L4 16 L-2 11 L6 10 Z" fill="#FBBF24" stroke="#B45309" stroke-width="1"/>
        </g>

        <!-- Angka Nominal Besar Kiri Atas -->
        <text x="14" y="68" font-size="20" font-weight="900" font-family="'Fredoka', sans-serif" fill="#FFFFFF" style="text-shadow: 1px 1.5px 3px rgba(0,0,0,0.4);">
          ${data.num}
        </text>

        <!-- Tulisan Huruf Nominal Bawah Kiri -->
        <text x="14" y="82" font-size="6.5" font-weight="900" fill="rgba(255,255,255,0.95)" letter-spacing="0.8">
          ${data.spelled}
        </text>
        <text x="14" y="94" font-size="4.8" font-weight="bold" fill="rgba(255,255,255,0.8)">
          EMISI 2022
        </text>

        <!-- Ilustrasi Tokoh Pahlawan di Kanan -->
        ${data.portrait}

        <!-- Label Nama Tokoh Pahlawan Bawah -->
        <rect x="144" y="94" width="88" height="14" rx="4" fill="rgba(0,0,0,0.45)"/>
        <text x="188" y="104" font-size="5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
          ${data.hero}
        </text>

        <!-- Nominal Sudut Kanan Bawah -->
        <text x="135" y="105" font-size="11" font-weight="900" font-family="'Fredoka', sans-serif" fill="#FFFFFF" text-anchor="end">
          ${data.num}
        </text>
      </svg>`;
  },

  // UPI Cibiru Emblem
  upiLogo: (cls = "w-10 h-10") => `
    <svg class="${cls}" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" fill="#DC2626" stroke="#FEF08A" stroke-width="4"/>
      <circle cx="50" cy="50" r="38" fill="#F8FAFC"/>
      <path d="M50 16 L58 35 L78 37 L63 51 L67 71 L50 61 L33 71 L37 51 L22 37 L42 35 Z" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
      <circle cx="50" cy="46" r="12" fill="#DC2626"/>
      <text x="50" y="51" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="Arial, sans-serif">UPI</text>
      <path d="M35 77 Q50 85 65 77" stroke="#DC2626" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
};

window.RBC_ICONS = RBC_ICONS;
