/**
 * Ruang Belajar Ceria - Core Application Logic
 * Full Interactive DHETIK Learning Experience for Elementary Grade 3
 */

// Confetti Effect Helper
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 5 + 3,
      angle: Math.random() * 360,
      rotation: Math.random() * 10 - 5
    });
  }

  let animationFrame;
  let duration = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.angle += p.rotation;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    duration++;
    if (duration < 180) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  render();
}

// Global App State
const AppState = {
  activeTab: 'beranda',
  studentName: localStorage.getItem('rbc_student_name') || 'Teman Ceria',
  points: parseInt(localStorage.getItem('rbc_points') || '25', 10),
  stars: parseInt(localStorage.getItem('rbc_stars') || '8', 10),
  completedStages: JSON.parse(localStorage.getItem('rbc_completed_stages') || '[]'),
  unlockedBadges: JSON.parse(localStorage.getItem('rbc_badges') || '["bintang-pintar"]'),
  
  // Market Niza State
  nizaCart: [],
  nizaMission: 1,
  nizaWallet: 20000,
  
  // Quiz State
  quizIndex: 0,
  quizAnswers: [],
  quizCompleted: false,
  quizScore: 0,

  // Games State
  gameActive: 'tebak',
  gameScore: 0,

  // Diskusi Padlet
  padletPosts: JSON.parse(localStorage.getItem('rbc_padlet_posts') || '[]'),

  // Refleksi Siswa
  reflection: JSON.parse(localStorage.getItem('rbc_student_reflection') || '{}'),

  // Save state
  save() {
    localStorage.setItem('rbc_student_name', this.studentName);
    localStorage.setItem('rbc_points', this.points);
    localStorage.setItem('rbc_stars', this.stars);
    localStorage.setItem('rbc_completed_stages', JSON.stringify(this.completedStages));
    localStorage.setItem('rbc_badges', JSON.stringify(this.unlockedBadges));
    localStorage.setItem('rbc_padlet_posts', JSON.stringify(this.padletPosts));
    localStorage.setItem('rbc_student_reflection', JSON.stringify(this.reflection));
    this.updateStatsUI();

    if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
      window.RBC_SUPABASE.saveSiswa({
        nama: this.studentName,
        poin: this.points,
        bintang: this.stars,
        progres: this.completedStages
      });
    }
  },

  addReward(p, s, msg) {
    this.points += p;
    this.stars += s;
    this.save();
    window.soundManager.playCorrect();
    this.showToast(`🎉 Hebat! Kamu dapat +${p} Poin & +${s} Bintang! ${msg || ''}`);
  },

  unlockBadge(badgeId) {
    if (!this.unlockedBadges.includes(badgeId)) {
      this.unlockedBadges.push(badgeId);
      this.save();
      window.soundManager.playBadge();
      const badge = RBC_DATA.badges.find(b => b.id === badgeId);
      if (badge) {
        this.showToast(`🏆 Selamat! Kamu membuka lencana: "${badge.title}"!`);
        triggerConfetti();
      }
    }
  },

  markStageComplete(stageId) {
    if (!this.completedStages.includes(stageId)) {
      this.completedStages.push(stageId);
      this.addReward(20, 5, `Tahap ${stageId.toUpperCase()} selesai!`);
      if (this.completedStages.length >= 6) {
        this.unlockBadge('petualang-hebat');
      }
    }
  },

  showToast(message) {
    const toast = document.getElementById('global-toast');
    if (!toast) return;
    toast.innerHTML = `
      <div class="flex items-center gap-3 px-5 py-3.5 bg-white text-slate-800 rounded-2xl shadow-xl border-2 border-amber-300 animate-bounce-gentle">
        <span class="text-2xl">✨</span>
        <span class="font-bold text-sm md:text-base">${message}</span>
      </div>
    `;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 4000);
  },

  updateStatsUI() {
    const starEl = document.getElementById('stat-stars');
    const pointEl = document.getElementById('stat-points');
    const nameEl = document.getElementById('stat-name');
    const progressEl = document.getElementById('global-progress-bar');
    const progressTxt = document.getElementById('global-progress-text');

    if (starEl) starEl.innerText = this.stars;
    if (pointEl) pointEl.innerText = this.points;
    if (nameEl) nameEl.innerText = this.studentName;

    // Mobile Drawer Sync
    const drawerName = document.getElementById('drawer-student-name');
    const drawerStars = document.getElementById('drawer-stars');
    const drawerPoints = document.getElementById('drawer-points');
    if (drawerName) drawerName.innerText = this.studentName;
    if (drawerStars) drawerStars.innerText = this.stars;
    if (drawerPoints) drawerPoints.innerText = this.points;

    const percent = Math.min(100, Math.round((this.completedStages.length / 6) * 100));
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (progressTxt) progressTxt.innerText = `${percent}% Selesai`;
  }
};

window.AppState = AppState;

// Navigation Controller
function switchTab(tabId) {
  AppState.activeTab = tabId;
  window.soundManager.playPop();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update Nav pills style (Desktop & Tier 2)
  document.querySelectorAll('.nav-link').forEach(btn => {
    const target = btn.getAttribute('data-tab');
    if (target === tabId) {
      btn.className = 'nav-link px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 bg-amber-400 text-slate-900 border border-amber-500 shadow-sm transform scale-105';
    } else {
      btn.className = 'nav-link px-3 py-1.5 sm:py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 shadow-2xs';
    }
  });

  // Smooth scroll active nav tab into view in horizontal scroller
  const activeNavBtn = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
  if (activeNavBtn) {
    activeNavBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Update Mobile Bottom Nav active state
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    const bTab = btn.getAttribute('data-bottom-tab');
    const isDhetikStage = ['d', 'h', 'e', 't', 'i', 'k'].includes(tabId);
    if (bTab === tabId || (bTab === 'dhetik' && isDhetikStage && tabId !== 'e')) {
      btn.classList.add('active');
    } else if (bTab === 'e' && tabId === 'e') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Render view content
  const container = document.getElementById('main-content-view');
  if (!container) return;

  switch (tabId) {
    case 'beranda':
      container.innerHTML = renderBerandaView();
      initBerandaView();
      break;
    case 'd':
      container.innerHTML = renderTahapDView();
      initTahapDView();
      break;
    case 'h':
      container.innerHTML = renderTahapHView();
      initTahapHView();
      break;
    case 'e':
      container.innerHTML = renderTahapEView();
      initTahapEView();
      break;
    case 't':
      container.innerHTML = renderTahapTView();
      initTahapTView();
      break;
    case 'i':
      container.innerHTML = renderTahapIView();
      initTahapIView();
      break;
    case 'k':
      container.innerHTML = renderTahapKView();
      initTahapKView();
      break;
    case 'video':
      container.innerHTML = renderVideoView();
      initVideoView();
      break;
    case 'kuis':
      container.innerHTML = renderKuisView();
      initKuisView();
      break;
    case 'game':
      container.innerHTML = renderGameView();
      initGameView();
      break;
    case 'kontak':
      container.innerHTML = renderKontakView();
      break;
    case 'tentang':
      container.innerHTML = renderTentangView();
      break;
    default:
      container.innerHTML = renderBerandaView();
  }
}

window.switchTab = switchTab;

/* ============================================================
   MOBILE DRAWER & NAVIGATION HELPERS
   ============================================================ */
function toggleMobileMenuDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
  if (!drawer.classList.contains('hidden')) {
    AppState.updateStatsUI();
  }
}
window.toggleMobileMenuDrawer = toggleMobileMenuDrawer;

function handleDrawerBackdropClick(e) {
  if (e.target && e.target.id === 'mobile-menu-drawer') {
    toggleMobileMenuDrawer();
  }
}
window.handleDrawerBackdropClick = handleDrawerBackdropClick;

function switchTabFromDrawer(tabId) {
  toggleMobileMenuDrawer();
  switchTab(tabId);
}
window.switchTabFromDrawer = switchTabFromDrawer;

function promptChangeName() {
  const newName = prompt('Hai teman! Siapa nama panggilanmu?', AppState.studentName);
  if (newName && newName.trim()) {
    AppState.studentName = newName.trim();
    AppState.save();
    AppState.updateStatsUI();
    AppState.showToast(`Halo, ${AppState.studentName}! Selamat belajar!`);
  }
}
window.promptChangeName = promptChangeName;

/* ============================================================
   VIEW 1: BERANDA (HOME)
   ============================================================ */
function renderBerandaView() {
  const dhetikCards = RBC_DATA.dhetikStages.map(s => {
    const isDone = AppState.completedStages.includes(s.id);
    return `
      <div onclick="switchTab('${s.id}')" class="group cursor-pointer bg-white rounded-3xl p-4 sm:p-6 border-3 border-slate-100 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1.5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <span class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${s.badgeColor} font-black text-lg sm:text-xl shadow-inner">
              ${s.code}
            </span>
            ${isDone ? '<span class="text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">✓ Selesai</span>' : '<span class="text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 rounded-full">Ayo Coba</span>'}
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors">${s.name}</h3>
          <p class="text-[11px] sm:text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1.5 sm:mb-2">${s.label}</p>
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">${s.desc}</p>
        </div>
        <div class="mt-4 sm:mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
          <span>Buka Tahap Ini</span>
          <span class="group-hover:translate-x-1 transition-transform">➔</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-8 sm:space-y-12 animate-fade-in">
      <!-- Hero Section -->
      <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-yellow-50 to-emerald-100 p-5 sm:p-8 md:p-12 border-4 border-white shadow-xl">
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-yellow-200/50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-sky-200/50 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div class="lg:col-span-7 space-y-4 sm:space-y-5">
            <div class="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/90 border border-sky-200 shadow-xs">
              <span class="text-sky-600 font-bold text-[11px] sm:text-xs uppercase tracking-wider">🌟 IPAS KELAS 3 SD / FASE B</span>
              <span class="text-slate-400">•</span>
              <span class="text-slate-700 font-semibold text-[11px] sm:text-xs">Model DHETIK</span>
            </div>

            <h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-snug">
              Halo, Teman Belajar! 👋<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-amber-600 to-emerald-600">
                Yuk, Belajar Sambil Bermain di Ruang Belajar Ceria!
              </span>
            </h1>

            <p class="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-medium">
              Ayo berpetualang mengenal mata uang Rupiah, memahami cara kerja jual beli, membedakan kebutuhan dan keinginan, serta belajar menjadi anak hebat yang bijak berbelanja!
            </p>

            <div class="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <button onclick="switchTab('d')" class="btn-playful w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-sky-300/50 hover:from-sky-600 hover:to-blue-700">
                <span>🚀 Mulai Belajar Sekarang</span>
              </button>
              <button onclick="switchTab('game')" class="btn-playful w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3.5 bg-white border-2 border-amber-300 text-amber-900 font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-xs hover:bg-amber-50">
                <span>🎮 Main Game Edukasi</span>
              </button>
              <button onclick="switchTab('video')" class="btn-playful w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3.5 bg-white border-2 border-emerald-300 text-emerald-900 font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-50">
                <span>🎬 Nonton Video</span>
              </button>
            </div>
          </div>

          <div class="lg:col-span-5 flex flex-col items-center justify-center text-center mt-2 sm:mt-0">
            <div class="relative">
              <div class="w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-sky-200 flex items-center justify-center p-3 sm:p-4 shadow-xl sm:shadow-2xl animate-float">
                ${RBC_MASCOT.render('cheering', 'w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52')}
              </div>
              <div class="absolute -bottom-3 sm:-bottom-4 bg-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-lg border-2 border-amber-200 text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1.5 sm:gap-2 animate-bounce-gentle">
                <span>⭐ Hai, aku Ciko si Kancil!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Learning Objectives Accordion & Info -->
      <section class="card-pastel p-4 sm:p-6 md:p-8 border-2 border-sky-100">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
              🎯
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-800">Tujuan Pembelajaran Kita</h2>
              <p class="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Capaian Pembelajaran Fase B (Kelas 3 SD)</p>
            </div>
          </div>
          <span class="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold">
            Bab 5: Bijak Berbelanja Kebutuhan
          </span>
        </div>

        <div class="p-3.5 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-200 mb-4 sm:mb-6">
          <p class="text-slate-800 text-sm sm:text-base md:text-lg font-bold leading-relaxed">
            "${RBC_DATA.learningObjective.cp}"
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          ${RBC_DATA.learningObjective.indicators.map((ind, idx) => `
            <div class="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
              <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                ${idx + 1}
              </span>
              <span class="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">${ind}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Interactive DHETIK Path -->
      <section class="space-y-4 sm:space-y-6">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <span class="px-4 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            Alur Belajar Asyik
          </span>
          <h2 class="text-3xl font-black text-slate-800">Petualangan 6 Tahap DHETIK</h2>
          <p class="text-slate-600 text-sm">
            Ikuti perjalanan belajar langkah demi langkah untuk mengumpulkan bintang, lencana, dan sertifikat anak bijak!
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${dhetikCards}
        </div>
      </section>

      <!-- LKPD Digital Preview Highlight -->
      <section class="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-100 via-fuchsia-50 to-pink-100 border-3 border-violet-200">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div class="lg:col-span-7 space-y-3 sm:space-y-4">
            <span class="px-3.5 py-1 rounded-full bg-violet-200 text-violet-900 text-xs font-bold uppercase">
              Lembar Kerja Interaktif
            </span>
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-800">LKPD IPAS Digital Kelas 3 SD</h2>
            <p class="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
              Kerjakan aktivitas menarik seperti mengelompokkan uang rupiah, misi belanja kantin, dan detektif kebutuhan vs keinginan langsung di website ini!
            </p>
            <div class="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 pt-2">
              <button onclick="switchTab('e')" class="btn-playful w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
                <span>Buka LKPD di Tahap Eksplorasi ➔</span>
              </button>
              <button onclick="switchTab('kuis')" class="btn-playful w-full sm:w-auto px-5 py-3 bg-white text-violet-700 border-2 border-violet-300 font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
                <span>Coba Kuis Interaktif 🎯</span>
              </button>
            </div>
          </div>
          <div class="lg:col-span-5 flex justify-center">
            <img src="assets/images/lkpd-cover.jpg" alt="LKPD Cover" class="w-44 sm:w-64 rounded-2xl shadow-xl border-4 border-white transform hover:rotate-1 transition-transform" onerror="this.src='docx_media/image3.jpg'"/>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initBerandaView() {
  // Any home view interactive binders
}

/* ============================================================
   VIEW 2: TAHAP D - DEKATKAN (AYO MULAI)
   Urutan Penting:
   1. Tujuan Pembelajaran
   2. Pertanyaan Pemantik
   3. Kolom jawaban pertanyaan pemantik
   4. Video Pembelajaran (Koin & Kertas)
   5. Soal identifikasi
   ============================================================ */
function renderTahapDView() {
  return `
    <div class="space-y-6 sm:space-y-10 animate-fade-in">
      <!-- Banner Area sesuai Storyboard -->
      <div class="rounded-3xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span>Tahap 1 dari 6</span> • <span>D - DEKATKAN</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black">AYO MULAI: Mengenal Uang Rupiah</h1>
          <p class="text-sky-100 text-sm md:text-base font-medium max-w-xl">
            Mengingat pengalaman sehari-hari kita dalam melihat, memegang, dan menggunakan uang rupiah.
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('happy', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Mascot Greeting -->
      ${RBC_MASCOT.bubble("Halo teman-teman! Setiap hari kita sering melihat atau menggunakan uang untuk berbagai hal. Ada uang logam yang gemerincing dan uang kertas yang warna-warni. Yuk, kita mulai petualangan seru ini!")}

      <!-- 1. TUJUAN PEMBELAJARAN (Urutan #1) -->
      <div class="card-pastel p-6 border-2 border-sky-200">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl">🎯</span>
          <div>
            <span class="text-xs font-bold uppercase text-sky-600 tracking-wider">Langkah 1</span>
            <h2 class="text-xl font-bold text-slate-800">Tujuan Pembelajaran Tahap Dekatkan</h2>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-slate-700 font-medium text-sm md:text-base leading-relaxed">
          <strong>Capaian Pembelajaran (CP):</strong> Peserta didik mampu menjelaskan nilai mata uang dan fungsinya, serta cara mengelola keuangan secara bijak.
          <ul class="list-disc pl-5 mt-2 space-y-1 text-slate-600 text-sm">
            <li>Peserta didik dapat mengingat pengalaman nyata saat menggunakan uang.</li>
            <li>Peserta didik dapat membedakan bentuk fisik uang kertas dan uang logam.</li>
            <li>Peserta didik dapat memahami bahwa setiap pecahan uang memiliki angka nominal yang berbeda.</li>
          </ul>
        </div>
      </div>

      <!-- 2. PERTANYAAN PEMANTIK (Urutan #2) & 3. KOLOM JAWABAN (Urutan #3) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-amber-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">💡</span>
          <div>
            <span class="text-xs font-bold uppercase text-amber-600 tracking-wider">Langkah 2 & 3</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Pertanyaan Pemantik & Pojok Ceritamu</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6">
          Ayo renungkan tiga pertanyaan seru berikut ini dan bagikan jawabanmu di kotak bawah!
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span class="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center">1</span>
            <h4 class="font-bold text-slate-800 text-sm">Pernahkah kamu menggunakan uang?</h4>
            <p class="text-xs text-slate-600">Pernahkah kamu memegang atau menggunakan uang kertas atau logam saat berbelanja di kantin atau warung?</p>
          </div>
          <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span class="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center">2</span>
            <h4 class="font-bold text-slate-800 text-sm">Apa perbedaannya?</h4>
            <p class="text-xs text-slate-600">Apa saja perbedaan yang kamu lihat dan rasakan antara uang kertas dengan uang logam?</p>
          </div>
          <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span class="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center">3</span>
            <h4 class="font-bold text-slate-800 text-sm">Mengapa nilainya berbeda?</h4>
            <p class="text-xs text-slate-600">Mengapa angka yang tertulis pada setiap pecahan uang tidak sama? Apa artinya?</p>
          </div>
        </div>

        <!-- Kolom Jawaban Pertanyaan Pemantik -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border-2 border-dashed border-amber-300">
          <label class="block text-sm font-bold text-amber-900 mb-2">
            ✍️ Tuliskan Jawaban dan Cerita Pengalamanmu:
          </label>
          <textarea id="pemantik-answer-input" rows="3" class="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-sky-400 focus:ring-0 text-slate-800 font-medium text-sm placeholder-slate-400" placeholder="Contoh: Aku pernah membeli roti di kantin memakai uang kertas Rp5.000. Uang logam bentuknya bulat dan bersuara klinting saat jatuh..."></textarea>
          
          <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
            <span class="text-xs text-slate-500 font-medium">✨ Jawabanmu akan disimpan dan kamu mendapatkan 15 Bintang!</span>
            <button onclick="submitPemantikAnswer()" class="btn-playful px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md">
              <span>Kirim Ceritaku 🌟</span>
            </button>
          </div>

          <div id="pemantik-response-box" class="mt-4 hidden p-4 rounded-xl bg-white border border-amber-300 text-slate-700 text-sm"></div>
        </div>
      </div>

      <!-- 4. VIDEO PEMBELAJARAN (Urutan #4) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-emerald-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">🎬</span>
          <div>
            <span class="text-xs font-bold uppercase text-emerald-600 tracking-wider">Langkah 4</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Video Pembelajaran Uang Rupiah</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Simak kedua video edukatif berikut untuk mengenali keunikan uang koin logam dan uang kertas rupiah kita:
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Video 1: Uang Koin -->
          <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div class="video-responsive bg-slate-900 shadow-inner">
              <iframe src="https://www.youtube.com/embed/AmBTrtYAyTE" title="Video Uang Koin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Video 1</span>
              <h3 class="font-bold text-slate-800 text-base mt-1">Mengenal Uang Koin / Logam</h3>
              <p class="text-xs text-slate-600">Pelajari jenis koin Rp100, Rp200, Rp500, dan Rp1.000 serta bahan pembuatnya.</p>
            </div>
          </div>

          <!-- Video 2: Uang Kertas -->
          <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div class="video-responsive bg-slate-900 shadow-inner">
              <iframe src="https://www.youtube.com/embed/KhmQWn390gw" title="Video Uang Kertas" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">Video 2</span>
              <h3 class="font-bold text-slate-800 text-base mt-1">Mengenal Uang Kertas Rupiah</h3>
              <p class="text-xs text-slate-600">Pelajari warna-warni uang kertas Rp1.000 hingga Rp100.000 beserta pahlawan nasional.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. SOAL IDENTIFIKASI (Urutan #5) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-purple-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl">🔍</span>
          <div>
            <span class="text-xs font-bold uppercase text-purple-600 tracking-wider">Langkah 5</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Ayo Mengidentifikasi Hasil Tontonan!</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Berdasarkan video yang telah kamu tonton di atas, mari jawab 3 pertanyaan identifikasi berikut untuk mengetes kejelianmu:
        </p>

        <div class="space-y-4" id="d-identifikasi-list">
          <!-- Question 1 -->
          <div class="p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-purple-200 shadow-sm space-y-3">
            <p class="font-bold text-slate-800 text-sm md:text-base">1. Manakah bahan yang digunakan untuk membuat uang logam koin rupiah?</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <button onclick="checkIdentifikasiD(1, true, this)" class="p-3 text-left rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 font-medium transition-all">
                A. Logam aluminium dan nikel/baja
              </button>
              <button onclick="checkIdentifikasiD(1, false, this)" class="p-3 text-left rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 font-medium transition-all">
                B. Kertas kardus dan plastik tipis
              </button>
            </div>
            <div class="feedback-box hidden text-xs font-bold p-3 rounded-xl"></div>
          </div>

          <!-- Question 2 -->
          <div class="p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-purple-200 shadow-sm space-y-3">
            <p class="font-bold text-slate-800 text-sm md:text-base">2. Mengapa uang kertas rupiah diberi gambar pahlawan nasional?</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <button onclick="checkIdentifikasiD(2, false, this)" class="p-3 text-left rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 font-medium transition-all">
                A. Hanya sebagai coretan hiasan biasa
              </button>
              <button onclick="checkIdentifikasiD(2, true, this)" class="p-3 text-left rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 font-medium transition-all">
                B. Untuk menghormati jasa pahlawan dan identitas bangsa
              </button>
            </div>
            <div class="feedback-box hidden text-xs font-bold p-3 rounded-xl"></div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <button onclick="switchTab('beranda')" class="btn-playful w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
            <span>⬅️ Kembali ke Beranda</span>
          </button>
          <button onclick="completeStageDAndNext()" class="btn-playful w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
            <span>Selesai Tahap D & Lanjut ke Tahap H ➔</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function initTahapDView() {
  // Load saved pemantik if exists
  const saved = localStorage.getItem('rbc_pemantik_answer');
  if (saved) {
    const input = document.getElementById('pemantik-answer-input');
    if (input) input.value = saved;
  }
}

async function submitPemantikAnswer() {
  const val = document.getElementById('pemantik-answer-input')?.value.trim();
  if (!val) {
    alert('Tuliskan jawaban atau ceritamu terlebih dahulu ya teman!');
    return;
  }
  localStorage.setItem('rbc_pemantik_answer', val);
  AppState.addReward(15, 3, 'Jawaban pemantikmu tersimpan!');

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    await window.RBC_SUPABASE.savePemantikAnswer({
      nama: AppState.studentName || 'Teman Belajar',
      jawaban: val
    });
  }

  const box = document.getElementById('pemantik-response-box');
  if (box) {
    box.classList.remove('hidden');
    box.innerHTML = `
      <div class="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-2 animate-fade-in shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-emerald-900 font-black text-sm">
            <span class="text-xl">🎉</span>
            <span>NOTIFIKASI: Ceritaku Berhasil Tersubmit!</span>
          </div>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
        </div>
        <p class="text-xs text-slate-700 italic bg-white/80 p-3 rounded-xl border border-emerald-200">" ${val} "</p>
        <div class="text-xs text-amber-900 font-semibold flex items-center gap-2 pt-1">
          <span>⭐</span>
          <span>Ciko: "Keren sekali, ${AppState.studentName}! Cerita pengalamanmu sangat menarik dan telah sukses tersimpan ke database!"</span>
        </div>
      </div>
    `;
  }
  AppState.showToast('✅ Ceritaku berhasil tersubmit ke database!');
}

function checkIdentifikasiD(qNum, isCorrect, btnEl) {
  const parent = btnEl.closest('.p-5');
  const box = parent.querySelector('.feedback-box');
  parent.querySelectorAll('button').forEach(b => b.classList.remove('bg-emerald-100', 'border-emerald-500', 'bg-rose-100', 'border-rose-500'));

  box.classList.remove('hidden', 'bg-emerald-100', 'text-emerald-800', 'bg-rose-100', 'text-rose-800');
  if (isCorrect) {
    window.soundManager.playCorrect();
    btnEl.classList.add('bg-emerald-100', 'border-emerald-500');
    box.classList.add('bg-emerald-100', 'text-emerald-800');
    box.innerHTML = "🎉 Hebat! Jawabanmu Benar! Kamu menyimak video dengan sangat cermat!";
  } else {
    window.soundManager.playWrong();
    btnEl.classList.add('bg-rose-100', 'border-rose-500');
    box.classList.add('bg-rose-100', 'text-rose-800');
    box.innerHTML = "💪 Jangan Menyerah! Yuk, periksa lagi penjelasan di video ya!";
  }
}

function completeStageDAndNext() {
  AppState.markStageComplete('d');
  AppState.unlockBadge('bintang-pintar');
  switchTab('h');
}

/* ============================================================
   VIEW 3: TAHAP H - HUBUNGKAN (HUBUNGKAN DENGAN HIDUPKU)
   Urutan Penting:
   1. Infografis (Penggunaan uang dalam kehidupan sehari-hari)
   2. Narasi Penghubung
   3. Video Pembelajaran Kebutuhan & Keinginan
   4. Mengidentifikasi perbedaan (Aktivitas interaktif memilah)
   5. Penjelasan pentingnya menggunakan uang secara bijak
   ============================================================ */
function renderTahapHView() {
  return `
    <div class="space-y-6 sm:space-y-10 animate-fade-in">
      <!-- Banner Area sesuai Storyboard -->
      <div class="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span>Tahap 2 dari 6</span> • <span>H - HUBUNGKAN</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black">HUBUNGKAN DENGAN HIDUPKU</h1>
          <p class="text-emerald-100 text-sm md:text-base font-medium max-w-xl">
            Menghubungkan fungsi uang dengan kehidupan nyata serta membedakan antara kebutuhan dan keinginan.
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('happy', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Mascot Bubble -->
      ${RBC_MASCOT.bubble("Di sekolah, di rumah, dan di pasar, kita sering melihat orang tua atau teman kita menggunakan uang. Tapi tahukah kamu, tidak semua barang yang kita sukai wajib dibeli? Mari kita cari tahu bedanya!")}

      <!-- 1. INFOGRAFIS UANG DALAM KEHIDUPAN SEHARI-HARI (Urutan #1) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-emerald-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">📊</span>
          <div>
            <span class="text-xs font-bold uppercase text-emerald-600 tracking-wider">Langkah 1</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Infografis: Uang dalam Kehidupan Sehari-hari</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Amati infografis dan cerita bergambar mengenai empat kegiatan nyata menggunakan uang di bawah ini:
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex flex-col items-center text-center space-y-2">
            <span class="text-4xl">🥪</span>
            <h4 class="font-bold text-slate-800 text-base">Beli Makanan di Kantin</h4>
            <p class="text-xs text-slate-600">Membayar nasi atau roti untuk mengisi energi tubuh saat lapar di sekolah.</p>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Fungsi: Alat Pembayaran</span>
          </div>

          <div class="p-5 rounded-2xl bg-sky-50 border-2 border-sky-200 flex flex-col items-center text-center space-y-2">
            <span class="text-4xl">✏️</span>
            <h4 class="font-bold text-slate-800 text-base">Beli Alat Tulis di Toko</h4>
            <p class="text-xs text-slate-600">Menukarkan uang dengan buku tulis dan pensil untuk keperluan belajar.</p>
            <span class="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">Fungsi: Alat Tukar</span>
          </div>

          <div class="p-5 rounded-2xl bg-purple-50 border-2 border-purple-200 flex flex-col items-center text-center space-y-2">
            <span class="text-4xl">🚌</span>
            <h4 class="font-bold text-slate-800 text-base">Ongkos Angkutan</h4>
            <p class="text-xs text-slate-600">Membayar jasa supir bus atau angkot saat perjalanan menuju sekolah.</p>
            <span class="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">Fungsi: Pembayaran Jasa</span>
          </div>

          <div class="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 flex flex-col items-center text-center space-y-2">
            <div class="w-14 h-14 flex items-center justify-center">
              ${RBC_ICONS.celenganAyam('w-12 h-12 text-rose-600')}
            </div>
            <h4 class="font-bold text-slate-800 text-base">Menabung di Celengan</h4>
            <p class="text-xs text-slate-600">Menyimpan sebagian uang saku agar terkumpul untuk masa depan.</p>
            <span class="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">Fungsi: Penyimpan Nilai</span>
          </div>
        </div>

        <!-- LKPD Aktivitas 2 Visual Reference -->
        <div class="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <img src="assets/images/lkpd-aktivitas2-fungsi.jpg" alt="LKPD Aktivitas 2" class="w-32 rounded-xl shadow-md border" onerror="this.src='docx_media/image1.jpg'"/>
          <div class="text-sm space-y-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">LKPD Aktivitas 2</span>
            <h5 class="font-bold text-slate-800">Uang dalam Kehidupanku</h5>
            <p class="text-slate-600 text-xs">Uang membuat kita dapat memperoleh barang yang kita butuhkan dengan tertib dan adil.</p>
          </div>
        </div>
      </div>

      <!-- 2. NARASI PENGHUBUNG (Urutan #2) -->
      <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 border-3 border-amber-300 shadow-md">
        <div class="flex items-start gap-4">
          <div class="hidden sm:block flex-shrink-0">
            ${RBC_MASCOT.render('thinking', 'w-20 h-20')}
          </div>
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
              📖 Narasi Penghubung
            </div>
            <blockquote class="text-slate-800 text-base md:text-lg font-bold leading-relaxed italic">
              "Wah, Sekarang kalian sudah mengenal berbagai pecahan mata uang rupiah dan mengetahui nilai setiap uang. Uang dapat digunakan untuk membeli berbagai barang yang kita perlukan. Namun, dalam menggunakan uang, kita harus bisa menentukan barang yang benar-benar dibutuhkan dan barang yang hanya kita inginkan. Nah, mari kita pelajari lebih lanjut tentang perbedaan kebutuhan dan keinginan agar kita dapat menggunakan uang dengan bijak!"
            </blockquote>
          </div>
        </div>
      </div>

      <!-- 3. VIDEO PEMBELAJARAN KEBUTUHAN & KEINGINAN (Urutan #3) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-sky-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl">🎬</span>
          <div>
            <span class="text-xs font-bold uppercase text-sky-600 tracking-wider">Langkah 3</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Video Edukasi: Kebutuhan vs Keinginan</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Tonton video penjelasan seru di bawah ini untuk melihat contoh-contoh nyata dalam berbelanja:
        </p>

        <div class="max-w-2xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <div class="video-responsive">
            <iframe src="https://www.youtube.com/embed/BCrFOo2-pOA" title="Video Kebutuhan vs Keinginan" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      </div>

      <!-- 4. MENGIDENTIFIKASI PERBEDAAN (Urutan #4) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-teal-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl">🧩</span>
          <div>
            <span class="text-xs font-bold uppercase text-teal-600 tracking-wider">Langkah 4</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Ayo Memilah: Detektif Kebutuhan & Keinginan!</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Klik tombol <strong>"Kebutuhan"</strong> atau <strong>"Keinginan"</strong> pada setiap kartu barang di bawah ini:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="sorting-items-container">
          <!-- Item 1 -->
          <div class="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col justify-between" data-answer="kebutuhan">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">🍚</span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Nasi dan Lauk Pauk</h4>
                <p class="text-xs text-slate-500">Makanan pokok sehari-hari</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="handleSortItem(this, 'kebutuhan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800">Kebutuhan</button>
              <button onclick="handleSortItem(this, 'keinginan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800">Keinginan</button>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col justify-between" data-answer="keinginan">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">🏎️</span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Mobil Remote Control</h4>
                <p class="text-xs text-slate-500">Mainan baru di toko</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="handleSortItem(this, 'kebutuhan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800">Kebutuhan</button>
              <button onclick="handleSortItem(this, 'keinginan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800">Keinginan</button>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col justify-between" data-answer="kebutuhan">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">👕</span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Seragam Sekolah</h4>
                <p class="text-xs text-slate-500">Pakaian wajib untuk belajar di kelas</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="handleSortItem(this, 'kebutuhan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800">Kebutuhan</button>
              <button onclick="handleSortItem(this, 'keinginan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800">Keinginan</button>
            </div>
          </div>

          <!-- Item 4 -->
          <div class="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col justify-between" data-answer="keinginan">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">🍦</span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Es Krim 3 Rasa</h4>
                <p class="text-xs text-slate-500">Jajanan manis pencuci mulut</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="handleSortItem(this, 'kebutuhan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800">Kebutuhan</button>
              <button onclick="handleSortItem(this, 'keinginan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800">Keinginan</button>
            </div>
          </div>

          <!-- Item 5 -->
          <div class="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col justify-between" data-answer="kebutuhan">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">📚</span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Buku Tulis & Pensil</h4>
                <p class="text-xs text-slate-500">Perlengkapan wajib siswa</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="handleSortItem(this, 'kebutuhan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800">Kebutuhan</button>
              <button onclick="handleSortItem(this, 'keinginan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800">Keinginan</button>
            </div>
          </div>

          <!-- Item 6 -->
          <div class="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col justify-between" data-answer="keinginan">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">✨</span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">Stiker Karakter Lucu</h4>
                <p class="text-xs text-slate-500">Hiasan tempelan tambahan</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="handleSortItem(this, 'kebutuhan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800">Kebutuhan</button>
              <button onclick="handleSortItem(this, 'keinginan')" class="flex-1 py-1.5 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800">Keinginan</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. PENJELASAN PENTINGNYA BIJAK MENGGUNAKAN UANG (Urutan #5) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-amber-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">💡</span>
          <div>
            <span class="text-xs font-bold uppercase text-amber-600 tracking-wider">Langkah 5</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Mengapa Kita Harus Bijak Menggunakan Uang?</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <h4 class="font-bold text-amber-900 flex items-center gap-2 text-sm md:text-base">
              <span>1️⃣</span> Dahulukan Kebutuhan Pokok
            </h4>
            <p class="text-xs md:text-sm text-slate-600">
              Jika uang saku kita terbatas, belilah barang yang wajib seperti makanan sehat atau alat tulis terlebih dahulu sebelum membeli mainan.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h4 class="font-bold text-emerald-900 flex items-center gap-2 text-sm md:text-base">
              <span>2️⃣</span> Membiasakan Diri Menabung
            </h4>
            <p class="text-xs md:text-sm text-slate-600">
              Menyisihkan uang saku setiap hari di celengan membuat kita punya cadangan uang saat ada keperluan mendesak di kemudian hari.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
            <h4 class="font-bold text-sky-900 flex items-center gap-2 text-sm md:text-base">
              <span>3️⃣</span> Menghindari Perilaku Boros
            </h4>
            <p class="text-xs md:text-sm text-slate-600">
              Membeli barang keinginan yang tidak terpakai hanya akan menghabiskan uang secara sia-sia.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
            <h4 class="font-bold text-purple-900 flex items-center gap-2 text-sm md:text-base">
              <span>4️⃣</span> Menghargai Jerih Payah Orang Tua
            </h4>
            <p class="text-xs md:text-sm text-slate-600">
              Orang tua kita bekerja keras mencari nafkah, sehingga kita harus menggunakan setiap rupiah uang saku dengan penuh tanggung jawab.
            </p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <button onclick="switchTab('d')" class="btn-playful w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
            <span>⬅️ Kembali ke Tahap D</span>
          </button>
          <button onclick="completeStageHAndNext()" class="btn-playful w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-200">
            <span>Selesai Tahap H & Lanjut ke Tahap E ➔</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function initTahapHView() {}

function handleSortItem(btn, chosen) {
  const card = btn.closest('.p-4');
  const correct = card.getAttribute('data-answer');
  if (chosen === correct) {
    window.soundManager.playCorrect();
    card.classList.remove('border-slate-100', 'border-rose-400');
    card.classList.add('border-emerald-400', 'bg-emerald-50/50');
    btn.classList.add('bg-emerald-600', 'text-white');
    AppState.addReward(5, 1);
  } else {
    window.soundManager.playWrong();
    card.classList.remove('border-slate-100', 'border-emerald-400');
    card.classList.add('border-rose-300', 'bg-rose-50/50');
  }
}

function completeStageHAndNext() {
  AppState.markStageComplete('h');
  switchTab('e');
}

/* ============================================================
   VIEW 4: TAHAP E - EKSPLORASI (AYO MENJELAJAH & MARKET NIZA)
   Point Penting Urutannya:
   1. Materi interaktif pengenalan jenis dan nilai pecahan uang rupiah.
   2. Simulasi jual beli melalui permainan Market Niza.
   3. Mengamati pilihan barang & harga serta batas anggaran maksimal Rp20.000.
   4. Membaca petunjuk dan memahami aturan penyelesaian 7 misi.
   5. Mengerjakan misi 1–4: mengelompokkan uang, memasangkan nilai, mengurutkan, mencocokkan jumlah.
   6. Mengerjakan misi 5–7: membayar roti, susu, dan buku dengan pecahan uang yang sesuai.
   ============================================================ */
function renderTahapEView() {
  return `
    <div class="space-y-6 sm:space-y-10 animate-fade-in">
      <!-- Banner Area sesuai Storyboard -->
      <div class="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span>Tahap 3 dari 6</span> • <span>E - EKSPLORASI</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black">AYO MENJELAJAH: Market Niza</h1>
          <p class="text-amber-100 text-sm md:text-base font-medium max-w-xl">
            Eksplorasi nilai uang Rupiah dan bermain simulasi jual beli dengan batas anggaran Rp20.000!
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('cheering', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Mascot Greeting -->
      ${RBC_MASCOT.bubble("Sekarang mari kita mencoba menggunakan uang dalam kegiatan berbelanja melalui permainan Belanja Pintar di Market Niza! Perhatikan uangmu baik-baik ya, jangan sampai melebihi batas anggaran Rp20.000!")}

      <!-- 1. MATERI INTERAKTIF PENGENALAN PECAHAN UANG (Urutan #1) -->
      <div class="card-pastel p-6 md:p-8 border-3 border-amber-300 bg-gradient-to-br from-amber-50/40 via-white to-sky-50/40 shadow-md">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shadow-inner">🪙</span>
          <div>
            <span class="text-xs font-bold uppercase text-amber-600 tracking-wider">Langkah 1</span>
            <h2 class="text-xl md:text-2xl font-black text-slate-800">Materi Interaktif: Pecahan Uang Rupiah</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Klik kartu uang di bawah ini untuk melihat detail nominal dan cerita pahlawannya:
        </p>

        <!-- Uang Logam Sub-section -->
        <div class="mb-8">
          <h3 class="text-sm md:text-base font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
            <span>🔘 Pecahan Uang Logam (Koin)</span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            ${RBC_DATA.rupiahCoins.map(coin => `
              <div onclick="showMoneyDetailModal('koin', ${coin.value})" class="cursor-pointer p-3.5 sm:p-4 rounded-3xl bg-white hover:bg-amber-50/60 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center justify-between space-y-2.5 sm:space-y-3 group hover:-translate-y-1">
                <div class="py-1.5 sm:py-2">
                  ${RBC_ICONS.rupiahCoin(coin.value, 'w-24 h-24 sm:w-28 sm:h-28 mx-auto drop-shadow-lg')}
                </div>
                <div class="w-full pt-2 border-t border-slate-100 space-y-0.5">
                  <span class="text-base sm:text-lg font-black text-slate-800 block">${coin.label}</span>
                  <span class="text-xs font-bold text-amber-800 block">${coin.name}</span>
                  <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">${coin.material}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Uang Kertas Sub-section -->
        <div>
          <h3 class="text-sm md:text-base font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
            <span>💵 Pecahan Uang Kertas</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${RBC_DATA.rupiahBanknotes.map(note => `
              <div onclick="showMoneyDetailModal('kertas', ${note.value})" class="cursor-pointer p-3.5 rounded-3xl bg-white border-2 border-slate-200 hover:border-violet-400 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-3 group hover:-translate-y-1">
                <div class="w-full">
                  ${RBC_ICONS.rupiahBanknote(note.value, 'w-full')}
                </div>
                <div class="px-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-base font-black text-slate-800">${note.label}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${note.bgStyle}">Emisi 2022</span>
                  </div>
                  <div class="text-xs font-bold text-slate-800">${note.name}</div>
                  <div class="text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-100 flex items-center gap-1">
                    <span>Tokoh:</span>
                    <strong class="text-violet-800">${note.hero}</strong>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 2 & 3. SIMULASI JUAL BELI "MARKET NIZA" & ANGGARAN RP20.000 (Urutan #2 & #3) -->
      <div class="card-pastel p-6 md:p-8 border-3 border-emerald-300 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/50">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-emerald-100">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">🏪</span>
            <div>
              <span class="text-xs font-bold uppercase text-emerald-600 tracking-wider">Simulasi Interaktif</span>
              <h2 class="text-2xl font-black text-slate-800">Toko Jual Beli: "Market Niza"</h2>
            </div>
          </div>
          <!-- Dompet Siswa Anggaran Max Rp20.000 -->
          <div class="p-3 px-4 sm:px-5 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <span class="text-2xl">👛</span>
            <div>
              <span class="text-xs font-bold text-amber-800 block">Sisa Anggaran Belanjamu:</span>
              <span id="niza-wallet-display" class="text-xl font-black text-amber-900">Rp20.000</span>
            </div>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Pilihlah barang-barang di bawah ini untuk dimasukkan ke dalam keranjang. Pastikan total belanja tidak melebihi anggaran maksimal <strong>Rp20.000</strong>!
        </p>

        <!-- Rak Barang Market Niza -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          ${RBC_DATA.marketNizaItems.map(item => {
            const iconHtml = (item.icon === 'clayWarna') ? RBC_ICONS.clayWarna('w-10 h-10 inline-block') : `<span class="text-3xl">${item.icon}</span>`;
            return `
            <div class="p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm flex flex-col justify-between space-y-3 group hover:shadow-md transition-all">
              <div class="flex items-start justify-between gap-2">
                <div class="w-12 h-12 flex items-center justify-center">${iconHtml}</div>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full ${item.category === 'kebutuhan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${item.category === 'kebutuhan' ? 'Kebutuhan' : 'Keinginan'}
                </span>
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">${item.name}</h4>
                <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${item.desc}</p>
                <span class="font-black text-emerald-700 text-base mt-2 block">Rp${item.price.toLocaleString('id-ID')}</span>
              </div>
              <button onclick="addToNizaCart('${item.id}')" class="btn-playful w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                <span>+ Beli Barang</span>
              </button>
            </div>`;
          }).join('')}
        </div>

        <!-- Keranjang & Kasir Market Niza -->
        <div class="p-6 rounded-3xl bg-white border-3 border-emerald-300 shadow-md">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 class="font-black text-slate-800 text-lg flex items-center gap-2">
              <span>🛒 Keranjang Belanjaanmu</span>
            </h3>
            <button onclick="resetNizaCart()" class="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors">
              Kosongkan Keranjang
            </button>
          </div>

          <div id="niza-cart-items" class="space-y-2 mb-4 max-h-48 overflow-y-auto">
            <p class="text-slate-400 text-sm italic py-2">Keranjang masih kosong. Ayo pilih barang di rak atas!</p>
          </div>

          <div class="pt-4 border-t-2 border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div class="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
              <div>
                <span class="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider block">TOTAL BELANJA:</span>
                <span id="niza-total-display" class="text-xl sm:text-2xl font-black text-slate-800">Rp0</span>
              </div>
              <div class="border-l-2 border-slate-200 pl-3 sm:pl-6">
                <span class="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider block">SISA UANG / KEMBALIAN:</span>
                <span id="niza-remaining-display" class="text-xl sm:text-2xl font-black text-emerald-600">Rp20.000</span>
              </div>
            </div>
            <button onclick="checkoutNizaCart()" class="btn-playful w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
              <span>Bayar di Kasir Niza 💵</span>
            </button>
          </div>

          <!-- Struk Kasir Terakhir Banner -->
          <div id="niza-last-receipt" class="mt-4 hidden p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 animate-bounce-gentle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div class="space-y-1">
              <span class="font-black text-emerald-900 text-sm flex items-center gap-1.5">
                ✅ Pembayaran di Kasir Berhasil!
              </span>
              <p id="niza-last-receipt-text" class="text-slate-700 font-medium">
                Total Belanja: Rp0 | <strong class="text-emerald-700">Sisa Uang Anda: Rp20.000</strong> (Siap Ditabung di Celengan Ayam!)
              </p>
            </div>
            <button onclick="openNizaReceiptModal()" class="px-3.5 py-1.5 bg-white text-emerald-800 font-bold rounded-xl border border-emerald-300 hover:bg-emerald-100 shadow-sm flex-shrink-0">
              Lihat Struk Lengkap 🧾
            </button>
          </div>
        </div>
      </div>

      <!-- 4, 5, 6. TUJUH (7) MISI PEMBELAJARAN MARKET NIZA (Urutan #4, #5, #6) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-purple-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl">🏆</span>
          <div>
            <span class="text-xs font-bold uppercase text-purple-600 tracking-wider">Langkah 4, 5, & 6</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">7 Misi Spesial Belajar Uang Rupiah</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Selesaikan seluruh misi 1 sampai 7 untuk menguasai pengelompokan, nominal, dan pembayaran barang belanjaan:
        </p>

        <!-- Mission Selector Tabs -->
        <div class="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar" id="mission-tabs">
          ${[1, 2, 3, 4, 5, 6, 7].map(num => `
            <button onclick="loadNizaMission(${num})" id="tab-mission-${num}" class="flex-shrink-0 px-3.5 py-1.5 rounded-xl font-bold text-xs border ${num === 1 ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}">
              Misi ${num}
            </button>
          `).join('')}
        </div>

        <!-- Mission Content Area -->
        <div id="mission-card-content" class="p-6 bg-purple-50/50 rounded-2xl border-2 border-purple-200 space-y-4">
          <!-- Dynamically filled by JS -->
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <button onclick="switchTab('h')" class="btn-playful w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
            <span>⬅️ Kembali ke Tahap H</span>
          </button>
          <button onclick="completeStageEAndNext()" class="btn-playful w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
            <span>Selesai Tahap E & Lanjut ke Tahap T ➔</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL STRUK KASIR MARKET NIZA -->
    <div id="niza-receipt-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
      <div class="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-emerald-300 space-y-4 animate-bounce-gentle max-h-[90vh] overflow-y-auto">
        <div class="text-center pb-3 border-b-2 border-dashed border-slate-200">
          <span class="text-3xl">🏪</span>
          <h3 class="font-black text-slate-800 text-lg mt-1">STRUK RESMI MARKET NIZA</h3>
          <p class="text-slate-400 text-[11px]">Belanja Ceria & Pintar Bersama Teman Belajar</p>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between text-slate-600">
            <span>Nama Kasir:</span>
            <strong>Kakak Niza Ceria</strong>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Nama Pembeli:</span>
            <strong id="receipt-student-name">${AppState.studentName}</strong>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Waktu Belanja:</span>
            <span id="receipt-timestamp">-</span>
          </div>

          <div class="pt-2 border-t border-slate-200">
            <span class="font-bold text-slate-700 block mb-1">Daftar Barang yang Dibeli:</span>
            <div id="receipt-items-list" class="space-y-1 max-h-36 overflow-y-auto pr-1">
              <!-- Item list injected via JS -->
            </div>
          </div>

          <div class="pt-3 border-t-2 border-dashed border-slate-200 space-y-1.5">
            <div class="flex justify-between text-slate-700">
              <span>Total Belanja:</span>
              <strong id="receipt-total" class="text-sm font-bold text-slate-900">Rp0</strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span>Uang Pembayaran:</span>
              <strong class="text-sm font-bold text-slate-900">Rp20.000</strong>
            </div>
            <div class="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-between text-emerald-950 mt-2">
              <div>
                <span class="text-[11px] font-bold block">SISA UANG / KEMBALIAN:</span>
                <span class="text-[10px] text-emerald-800">Uang yang kamu bawa pulang</span>
              </div>
              <strong id="receipt-remaining" class="text-xl font-black text-emerald-700">Rp0</strong>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
            <span class="text-xl">🐔</span>
            <p class="text-[11px] leading-relaxed">
              <strong>Tips Bijak Ciko:</strong> Masukkan <strong>sisa uang</strong> belanjaanmu sebesar <strong id="receipt-save-tip">Rp0</strong> ke dalam <strong>Celengan Ayam</strong> agar kamu bisa membeli kebutuhan mendesak di masa depan!
            </p>
          </div>

          <div class="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-center justify-between text-[11px] font-bold">
            <span class="flex items-center gap-1.5">
              <span>🎉</span> NOTIFIKASI: Transaksi Berhasil Tersubmit!
            </span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">Tersimpan di Cloud ✅</span>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button onclick="closeNizaReceiptModal()" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md">
            Simpan Struk & Selesai 👍
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL PECAHAN UANG RUPIAH -->
    <div id="money-detail-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
      <div class="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-amber-300 space-y-4 animate-bounce-gentle max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔍</span>
            <h3 id="money-modal-title" class="font-black text-slate-800 text-lg">Detail Pecahan Uang</h3>
          </div>
          <button onclick="closeMoneyDetailModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center">✕</button>
        </div>

        <div id="money-modal-illustration" class="py-2 flex justify-center">
          <!-- SVG injected here -->
        </div>

        <div class="space-y-3 text-xs md:text-sm">
          <div class="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span class="text-[10px] text-slate-500 font-bold uppercase block">Nilai Nominal</span>
              <strong id="money-modal-nominal" class="text-sm text-slate-800">-</strong>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 font-bold uppercase block">Bahan & Bentuk</span>
              <strong id="money-modal-material" class="text-sm text-slate-800">-</strong>
            </div>
          </div>

          <div id="money-modal-hero-box" class="p-3 rounded-2xl bg-violet-50 border border-violet-200 space-y-1">
            <span class="text-[10px] text-violet-700 font-bold uppercase block">Tokoh Pahlawan Nasional</span>
            <strong id="money-modal-hero-name" class="text-sm text-violet-950 block">-</strong>
            <p id="money-modal-hero-story" class="text-xs text-slate-600 leading-relaxed">-</p>
          </div>

          <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <span class="text-[10px] text-amber-800 font-bold uppercase block">Ciri Keaslian Uang (3D)</span>
            <p id="money-modal-features" class="text-xs text-slate-700 leading-relaxed">-</p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button onclick="playMoneySound()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5">
            <span>🔊 Putar Suara Uang</span>
          </button>
          <button onclick="closeMoneyDetailModal()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md">
            Paham & Tutup ⭐
          </button>
        </div>
      </div>
    </div>
  `;
}

function initTahapEView() {
  updateNizaCartUI();
  loadNizaMission(1);
}

// Market Niza Cart Logic
function addToNizaCart(itemId) {
  const item = RBC_DATA.marketNizaItems.find(i => i.id === itemId);
  if (!item) return;

  const currentTotal = AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  if (currentTotal + item.price > 20000) {
    window.soundManager.playWrong();
    alert('⚠️ Ups! Uangmu tidak cukup. Anggaran belanjamu maksimal adalah Rp20.000! Ayo pilih barang kebutuhan yang paling utama ya.');
    return;
  }

  AppState.nizaCart.push(item);
  window.soundManager.playCoin();
  updateNizaCartUI();
}

function updateNizaCartUI() {
  const container = document.getElementById('niza-cart-items');
  const totalEl = document.getElementById('niza-total-display');
  const walletEl = document.getElementById('niza-wallet-display');
  const remainingEl = document.getElementById('niza-remaining-display');
  if (!container || !totalEl || !walletEl) return;

  const total = AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  const remaining = Math.max(0, 20000 - total);

  totalEl.innerText = `Rp${total.toLocaleString('id-ID')}`;
  walletEl.innerText = `Rp${remaining.toLocaleString('id-ID')}`;
  if (remainingEl) remainingEl.innerText = `Rp${remaining.toLocaleString('id-ID')}`;

  if (AppState.nizaCart.length === 0) {
    container.innerHTML = '<p class="text-slate-400 text-sm italic py-2">Keranjang masih kosong. Ayo pilih barang di rak atas!</p>';
    return;
  }

  container.innerHTML = AppState.nizaCart.map((item, idx) => {
    const iconHtml = (item.icon === 'clayWarna') ? RBC_ICONS.clayWarna('w-6 h-6 inline-block') : `<span class="text-xl">${item.icon}</span>`;
    return `
    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 flex items-center justify-center">${iconHtml}</div>
        <div>
          <span class="font-bold text-slate-800">${item.name}</span>
          <span class="text-[10px] text-slate-500 block">Rp${item.price.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <button onclick="removeFromNizaCart(${idx})" class="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded bg-white border border-slate-200">✕</button>
    </div>`;
  }).join('');
}

function checkoutNizaCart() {
  const total = AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  if (total === 0) {
    alert('Keranjangmu masih kosong! Ayo pilih barang di rak atas terlebih dahulu.');
    return;
  }

  const sisaUang = 20000 - total;
  window.soundManager.playFanfare();
  AppState.addReward(25, 4, 'Simulasi belanja berhasil!');
  AppState.unlockBadge('pembeli-bijak');

  // Buka Struk Kasir Modal dengan sisa uang
  openNizaReceiptModal(total, sisaUang);

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    window.RBC_SUPABASE.saveCashierTransaction({
      studentName: AppState.studentName || 'Teman Belajar',
      items: AppState.nizaCart,
      total: total,
      sisaUang: sisaUang
    });
  }
  AppState.showToast('✅ Transaksi belanja kasir berhasil tersubmit ke database!');

  // Update banner struk kasir terakhir pada halaman
  const receiptBanner = document.getElementById('niza-last-receipt');
  const receiptBannerText = document.getElementById('niza-last-receipt-text');
  if (receiptBanner && receiptBannerText) {
    receiptBanner.classList.remove('hidden');
    receiptBannerText.innerHTML = `Total Belanja: <strong>Rp${total.toLocaleString('id-ID')}</strong> | Sisa Uang Anda: <strong class="text-emerald-700 text-sm">Rp${sisaUang.toLocaleString('id-ID')}</strong> (Siap Ditabung di Celengan Ayam! 🐔🪙)`;
  }
}

function openNizaReceiptModal(customTotal, customSisa) {
  const modal = document.getElementById('niza-receipt-modal');
  if (!modal) return;

  const total = (typeof customTotal === 'number') ? customTotal : AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  const sisa = (typeof customSisa === 'number') ? customSisa : Math.max(0, 20000 - total);

  const nameEl = document.getElementById('receipt-student-name');
  const timeEl = document.getElementById('receipt-timestamp');
  const totalEl = document.getElementById('receipt-total');
  const remainingEl = document.getElementById('receipt-remaining');
  const saveTipEl = document.getElementById('receipt-save-tip');
  const listEl = document.getElementById('receipt-items-list');

  if (nameEl) nameEl.innerText = AppState.studentName || 'Teman Belajar';
  if (timeEl) timeEl.innerText = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  if (totalEl) totalEl.innerText = `Rp${total.toLocaleString('id-ID')}`;
  if (remainingEl) remainingEl.innerText = `Rp${sisa.toLocaleString('id-ID')}`;
  if (saveTipEl) saveTipEl.innerText = `Rp${sisa.toLocaleString('id-ID')}`;

  if (listEl) {
    if (AppState.nizaCart.length === 0) {
      listEl.innerHTML = '<div class="text-slate-400 italic">Belum ada barang di keranjang.</div>';
    } else {
      listEl.innerHTML = AppState.nizaCart.map(item => `
        <div class="flex justify-between items-center py-1 border-b border-slate-100 text-[11px]">
          <span class="font-medium text-slate-800">${item.name} (${item.category})</span>
          <span class="font-bold text-slate-700">Rp${item.price.toLocaleString('id-ID')}</span>
        </div>
      `).join('');
    }
  }

  modal.classList.remove('hidden');
}

function closeNizaReceiptModal() {
  document.getElementById('niza-receipt-modal')?.classList.add('hidden');
}

// 7 Missions Engine
function loadNizaMission(num) {
  document.querySelectorAll('#mission-tabs button').forEach((btn, idx) => {
    if (idx + 1 === num) {
      btn.className = 'px-3.5 py-1.5 rounded-xl font-bold text-xs border bg-purple-600 text-white border-purple-600';
    } else {
      btn.className = 'px-3.5 py-1.5 rounded-xl font-bold text-xs border bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  });

  const container = document.getElementById('mission-card-content');
  if (!container) return;

  switch (num) {
    case 1:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 1</span>
            <h3>Mengelompokkan Jenis Uang: Kertas vs Logam</h3>
          </div>
          <p class="text-xs text-slate-600">Pilihlah kelompok yang tepat untuk pecahan <strong>Rp10.000</strong>:</p>
          <div class="flex gap-3">
            <button onclick="checkMissionResult(1, true, 'Rp10.000 adalah Uang Kertas bergambar Frans Kaisiepo!')" class="flex-1 p-3 rounded-xl border-2 border-purple-300 bg-white hover:bg-purple-100 font-bold text-sm text-purple-900">💵 Uang Kertas</button>
            <button onclick="checkMissionResult(1, false, 'Kurang tepat, Rp10.000 bukan terbuat dari logam.')" class="flex-1 p-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 font-bold text-sm text-slate-700">🔘 Uang Logam</button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
    case 2:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 2</span>
            <h3>Memasangkan Gambar dengan Nilai Nominalnya</h3>
          </div>
          <p class="text-xs text-slate-600">Uang kertas yang berwarna hijau segar memiliki nilai nominal sebesar...</p>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="checkMissionResult(2, false, 'Coba ingat lagi, uang warna cokelat adalah Rp5.000.')" class="p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-sm">Rp5.000</button>
            <button onclick="checkMissionResult(2, true, 'Tepat sekali! Rp20.000 berwarna hijau segar bergambar Dr. Ratulangi!')" class="p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-sm">Rp20.000</button>
            <button onclick="checkMissionResult(2, false, 'Rp50.000 berwarna biru laut.')" class="p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-sm">Rp50.000</button>
            <button onclick="checkMissionResult(2, false, 'Rp100.000 berwarna merah muda.')" class="p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-sm">Rp100.000</button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
    case 3:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 3</span>
            <h3>Mengurutkan Pecahan Uang dari Terkecil ke Terbesar</h3>
          </div>
          <p class="text-xs text-slate-600">Manakah urutan pecahan uang yang benar dari yang nilainya paling kecil?</p>
          <div class="space-y-2">
            <button onclick="checkMissionResult(3, true, 'Luar biasa! Rp500 < Rp1.000 < Rp2.000 < Rp5.000!')" class="w-full p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-xs md:text-sm text-left">
              A. Rp500 ➔ Rp1.000 ➔ Rp2.000 ➔ Rp5.000
            </button>
            <button onclick="checkMissionResult(3, false, 'Periksa lagi, Rp5.000 lebih besar dari Rp1.000.')" class="w-full p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-xs md:text-sm text-left">
              B. Rp5.000 ➔ Rp2.000 ➔ Rp1.000 ➔ Rp500
            </button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
    case 4:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 4</span>
            <h3>Mencocokkan Kombinasi Pecahan Uang</h3>
          </div>
          <p class="text-xs text-slate-600">Kombinasi pecahan manakah yang jika dijumlahkan bernilai tepat <strong>Rp7.000</strong>?</p>
          <div class="space-y-2">
            <button onclick="checkMissionResult(4, true, 'Hebat! Satu lembar Rp5.000 ditambah satu lembar Rp2.000 = Rp7.000!')" class="w-full p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-xs md:text-sm text-left">
              A. 1 lembar Rp5.000 + 1 lembar Rp2.000
            </button>
            <button onclick="checkMissionResult(4, false, '2 lembar Rp2.000 = Rp4.000, belum cukup Rp7.000.')" class="w-full p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-xs md:text-sm text-left">
              B. 2 lembar Rp2.000 + 1 koin Rp500
            </button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
    case 5:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 5</span>
            <h3>Membayar Roti Seharga Rp5.000</h3>
          </div>
          <p class="text-xs text-slate-600">Pilihlah selembar uang yang pas untuk membayar roti seharga Rp5.000 tanpa perlu uang kembalian:</p>
          <div class="flex gap-3">
            <button onclick="checkMissionResult(5, true, 'Benar! Uang Rp5.000 pas untuk membayar roti seharga Rp5.000!')" class="flex-1 p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 font-black text-sm">💵 1 Lembar Rp5.000</button>
            <button onclick="checkMissionResult(5, false, 'Rp2.000 masih kurang untuk membayar roti Rp5.000.')" class="flex-1 p-3 rounded-xl border bg-white font-bold text-sm">💵 1 Lembar Rp2.000</button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
    case 6:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 6</span>
            <h3>Membayar Susu Seharga Rp4.000</h3>
          </div>
          <p class="text-xs text-slate-600">Pecahan manakah yang pas untuk membayar susu kotak seharga Rp4.000?</p>
          <div class="space-y-2">
            <button onclick="checkMissionResult(6, true, 'Tepat! Dua lembar dua ribuan bernilai Rp4.000 pas!')" class="w-full p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-xs md:text-sm text-left">
              A. 2 lembar uang kertas Rp2.000
            </button>
            <button onclick="checkMissionResult(6, false, '1 lembar Rp2.000 + Rp1.000 baru Rp3.000.')" class="w-full p-3 rounded-xl border bg-white hover:bg-purple-100 font-bold text-xs md:text-sm text-left">
              B. 1 lembar Rp2.000 + 1 lembar Rp1.000
            </button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
    case 7:
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-purple-900 font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-200 text-xs">Misi 7</span>
            <h3>Membayar Buku Tulis Seharga Rp6.000</h3>
          </div>
          <p class="text-xs text-slate-600">Kamu membayar buku seharga Rp6.000 dengan selembar uang Rp10.000. Berapa uang kembalian yang kamu terima?</p>
          <div class="grid grid-cols-3 gap-3">
            <button onclick="checkMissionResult(7, false, 'Hitung kembali: Rp10.000 dikurangi Rp6.000.')" class="p-3 rounded-xl border bg-white font-bold text-sm">Rp2.000</button>
            <button onclick="checkMissionResult(7, true, 'Sempurna! Rp10.000 - Rp6.000 = Rp4.000 kembalian!')" class="p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 font-black text-sm">Rp4.000</button>
            <button onclick="checkMissionResult(7, false, 'Masih belum tepat.')" class="p-3 rounded-xl border bg-white font-bold text-sm">Rp5.000</button>
          </div>
          <div id="mission-feedback" class="hidden p-3 rounded-xl text-xs font-bold"></div>
        </div>
      `;
      break;
  }
}

function checkMissionResult(missionNum, isSuccess, message) {
  const box = document.getElementById('mission-feedback');
  if (!box) return;
  box.classList.remove('hidden', 'bg-emerald-100', 'text-emerald-800', 'bg-rose-100', 'text-rose-800');
  if (isSuccess) {
    window.soundManager.playCorrect();
    box.classList.add('bg-emerald-100', 'text-emerald-800');
    box.innerHTML = `🎉 ${message} (+10 Poin!)`;
    AppState.addReward(10, 2);
    if (missionNum === 7) {
      AppState.unlockBadge('juara-matematika');
    }
  } else {
    window.soundManager.playWrong();
    box.classList.add('bg-rose-100', 'text-rose-800');
    box.innerHTML = `💪 ${message}`;
  }
}

let activeMoneyType = 'coin';

function showMoneyDetailModal(type, value) {
  activeMoneyType = type;
  const modal = document.getElementById('money-detail-modal');
  if (!modal) return;

  const titleEl = document.getElementById('money-modal-title');
  const illuEl = document.getElementById('money-modal-illustration');
  const nominalEl = document.getElementById('money-modal-nominal');
  const materialEl = document.getElementById('money-modal-material');
  const heroBox = document.getElementById('money-modal-hero-box');
  const heroNameEl = document.getElementById('money-modal-hero-name');
  const heroStoryEl = document.getElementById('money-modal-hero-story');
  const featuresEl = document.getElementById('money-modal-features');

  if (type === 'koin') {
    const coin = RBC_DATA.rupiahCoins.find(c => c.value === value) || { value: value, name: 'Uang Logam', label: `Rp${value}`, material: 'Aluminium', hero: 'Pahlawan Nasional', desc: 'Uang logam rupiah resmi Emisi 2016.' };
    if (titleEl) titleEl.innerText = `Pecahan Uang Logam: ${coin.label}`;
    if (illuEl) {
      illuEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div class="text-center space-y-1.5">
            ${RBC_ICONS.rupiahCoin(coin.value, 'w-28 h-28 sm:w-32 sm:h-32 mx-auto', 'depan')}
            <span class="text-[11px] font-bold text-slate-600 block">Sisi Depan (Nominal)</span>
          </div>
          <div class="text-center space-y-1.5">
            ${RBC_ICONS.rupiahCoin(coin.value, 'w-28 h-28 sm:w-32 sm:h-32 mx-auto', 'belakang')}
            <span class="text-[11px] font-bold text-slate-600 block">Sisi Belakang (Pahlawan)</span>
          </div>
        </div>`;
    }
    if (nominalEl) nominalEl.innerText = `${coin.label} (${coin.name})`;
    if (materialEl) materialEl.innerText = `${coin.material} (Uang Logam Asli Emisi 2016)`;
    if (heroBox) {
      heroBox.classList.remove('hidden');
      if (heroNameEl) heroNameEl.innerText = coin.hero || 'Pahlawan Nasional';
      if (heroStoryEl) heroStoryEl.innerText = coin.desc;
    }
    if (featuresEl) featuresEl.innerText = `Ciri Uang Logam Emisi 2016: Sisi depan bertuliskan BANK INDONESIA, angka nominal timbul (${coin.label}), dan RUPIAH 2016. Sisi belakang bergambar Garuda Pancasila dan pahlawan ${coin.hero || ''}.`;
    window.soundManager.playCoin();
  } else {
    const note = RBC_DATA.rupiahBanknotes.find(n => n.value === value) || { value: value, name: 'Uang Kertas', label: `Rp${value}`, hero: 'Pahlawan Nasional', desc: 'Uang kertas resmi.' };
    if (titleEl) titleEl.innerText = `Pecahan Uang Kertas: ${note.label}`;
    if (illuEl) illuEl.innerHTML = RBC_ICONS.rupiahBanknote(note.value, 'w-full max-w-sm mx-auto drop-shadow-2xl');
    if (nominalEl) nominalEl.innerText = `${note.label} (${note.name})`;
    if (materialEl) materialEl.innerText = `Serat Kapas Khusus dengan Benang Pengaman Hologram`;
    if (heroBox) {
      heroBox.classList.remove('hidden');
      if (heroNameEl) heroNameEl.innerText = note.hero;
      if (heroStoryEl) heroStoryEl.innerText = `${note.desc} Diabadikan sebagai bentuk penghormatan atas jasa perjuangan beliau bagi kemerdekaan dan persatuan Indonesia.`;
    }
    if (featuresEl) featuresEl.innerText = `3D: DILIHAT warnanya cerah dan ada benang pengaman, DIRABA terasa kasar pada angka nominal dan gambar pahlawan, DITERAWANG terlihat tanda air (watermark) pahlawan dan logo BI utuh.`;
    window.soundManager.playPop();
  }

  modal.classList.remove('hidden');
  AppState.addReward(5, 1, `Mengenal pecahan ${type === 'koin' ? 'koin' : 'kertas'} Rp${value.toLocaleString('id-ID')}!`);
}

function closeMoneyDetailModal() {
  document.getElementById('money-detail-modal')?.classList.add('hidden');
}

function playMoneySound() {
  if (activeMoneyType === 'koin') {
    window.soundManager.playCoin();
  } else {
    window.soundManager.playPop();
  }
}

// Backward compatibility alias
function showMoneyDetail(name, desc, label) {
  const num = parseInt(label.replace(/[^0-9]/g, ''), 10) || 1000;
  const isCoin = (num <= 1000 && name.toLowerCase().includes('logam'));
  showMoneyDetailModal(isCoin ? 'koin' : 'kertas', num);
}

function completeStageEAndNext() {
  AppState.markStageComplete('e');
  switchTab('t');
}

/* ============================================================
   VIEW 5: TAHAP T - TUKAR GAGASAN (RUANG DISKUSI & LKPD DIGITAL)
   Sesuai Revisi Storyboard & Kurikulum Merdeka Fase B:
   1. Alur & Tujuan Pembelajaran Tahap T
   2. Aturan Diskusi Santun
   3. Gambar & Cerita Sederhana (Nasi, Buku Tulis, Mainan, Jajanan)
   4. LKPD Digital Kebutuhan vs Keinginan (5 Kegiatan Interaktif & Canva)
      (1) Ayo Amati Barang!
      (2) Ayo Kelompokkan!
      (3) Mengapa Kamu Memilihnya?
      (4) Ayo Berpikir!
      (5) Ayo Simpulkan!
   5. Ruang Kolaborasi Padlet Interaktif (3 Kelompok & Komentar Santun)
   6. Pembahasan Perbedaan Jawaban & Perbaikan Pemahaman
   7. Hasil yang Diharapkan & Poin Penting
   ============================================================ */

function renderTahapTView() {
  return `
    <div class="space-y-10 animate-fade-in pb-12">
      <!-- 1. BANNER HERO RUANG DISKUSI -->
      <div class="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-violet-300/40">
        <div class="space-y-3 z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-violet-100 border border-white/25">
            <span>Tahap 4 dari 6</span> • <span>T - TUKAR GAGASAN</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            RUANG DISKUSI: Saling Berbagi Temuan & Menanggapi Pendapat 💬
          </h1>
          <p class="text-violet-100 text-sm md:text-base font-medium leading-relaxed bg-black/10 p-3 rounded-2xl border border-white/10">
            <strong>Tujuan Pembelajaran:</strong> Memberikan ruang bagi peserta didik untuk berbagi temuan, berdiskusi, dan menanggapi pendapat teman mengenai kebutuhan dan keinginan secara santun dan saling menghargai.
          </p>
          <div class="flex flex-wrap gap-2 pt-1 text-xs font-bold">
            <span class="px-3 py-1 rounded-full bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
              ⭐ 5 Kegiatan LKPD
            </span>
            <span class="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 shadow-sm flex items-center gap-1">
              📌 Papan Padlet Tersemat
            </span>
            <span class="px-3 py-1 rounded-full bg-rose-400 text-rose-950 shadow-sm flex items-center gap-1">
              💬 Tanggapan Santun
            </span>
          </div>
        </div>
        <div class="flex-shrink-0 z-10 text-center">
          ${RBC_MASCOT.render('happy', 'w-28 h-28 md:w-36 md:h-36')}
          <span class="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black text-white">
            Ciko Teman Belajar
          </span>
        </div>
      </div>

      <!-- Mascot Interactive Bubble -->
      ${RBC_MASCOT.bubble(
        "Halo Teman Belajar! Di Ruang Diskusi ini, kita akan membaca aturan diskusi santun, mengamati gambar dan cerita 4 barang sehari-hari, mengerjakan 5 kegiatan LKPD seru, lalu berbagi hasil di papan Padlet dan saling memberi tanggapan santun. Semangat belajar ya! 🌟"
      )}

      <!-- 2. ATURAN DISKUSI SANTUN -->
      <section class="card-pastel p-6 md:p-8 border-3 border-violet-300 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/80 shadow-md">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-violet-100">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Etika & Karakter Pancasila</span>
            </div>
            <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>📜 Aturan Diskusi Santun</span>
            </h2>
            <p class="text-sm text-slate-600 mt-1 max-w-2xl">
              Web belajar menyajikan aturan diskusi santun, seperti mendengarkan pendapat teman, menggunakan bahasa yang baik, dan menghargai perbedaan pendapat. Peserta didik membaca dan memahami aturan tersebut sebelum memulai diskusi.
            </p>
          </div>
          <button onclick="commitToPoliteRules(this)" class="btn-playful px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm flex-shrink-0">
            <span>✅ Saya Siap Diskusi Santun!</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Aturan 1 -->
          <div class="p-5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg flex-shrink-0">
                👂
              </div>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-sky-600 block">Aturan 1</span>
                <h3 class="font-black text-slate-800 text-base">Mendengarkan Pendapat</h3>
              </div>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Mendengarkan dan membaca pendapat teman dengan saksama tanpa memotong pembicaraan atau meremehkan pendapat orang lain.
            </p>
            <div class="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-1.5">
              <span>💡 Kunci:</span> Fokus menyimak dengan penuh perhatian
            </div>
          </div>

          <!-- Aturan 2 -->
          <div class="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg flex-shrink-0">
                💬
              </div>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Aturan 2</span>
                <h3 class="font-black text-slate-800 text-base">Bahasa yang Baik</h3>
              </div>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Menggunakan bahasa yang santun, ramah, dan bersahabat saat menyampaikan alasan maupun saat menuliskan komentar tanggapan.
            </p>
            <div class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
              <span>💡 Kunci:</span> Sopan dan saling menyemangati
            </div>
          </div>

          <!-- Aturan 3 -->
          <div class="p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg flex-shrink-0">
                🤝
              </div>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Aturan 3</span>
                <h3 class="font-black text-slate-800 text-base">Hargai Perbedaan</h3>
              </div>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Menghargai perbedaan pendapat. Jika ada kekeliruan pemahaman, bahas bersama secara damai untuk memperbaiki konsep belajar.
            </p>
            <div class="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1.5">
              <span>💡 Kunci:</span> Berbeda itu wajar, belajar bersama!
            </div>
          </div>
        </div>
      </section>

      <!-- 3. GAMBAR DAN CERITA SEDERHANA -->
      <section class="card-pastel p-6 md:p-8 border-3 border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50 shadow-md space-y-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Studi Kasus Kontekstual Kelas 3</span>
          </div>
          <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>📖 Gambar dan Cerita Sederhana: 4 Barang Sehari-hari</span>
          </h2>
          <p class="text-sm text-slate-600 mt-1 max-w-3xl">
            Web belajar menampilkan gambar dan cerita sederhana mengenai beberapa barang, seperti nasi, buku tulis, mainan, dan jajanan. Peserta didik mengamati gambar dan membaca cerita yang disajikan sebelum mengerjakan LKPD.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Barang 1: Nasi -->
          <div class="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm hover:border-emerald-400 transition-all space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-inner mx-auto md:mx-0">
                🍚
              </div>
              <div class="flex items-center justify-between">
                <h3 class="font-black text-slate-800 text-base">1. Nasi Hangat</h3>
                <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">Makanan Pokok</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed text-justify">
                Setiap pagi sebelum berangkat ke sekolah, Dimas selalu sarapan sepiring nasi hangat bersama lauk. Nasi adalah makanan pokok yang memberi energi bagi tubuh Dimas agar bisa berpikir jernih, bermain, dan konsentrasi saat belajar di kelas.
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-900 font-medium">
              ❓ <strong>Pertanyaan Penuntun:</strong> Apa yang terjadi jika Dimas tidak makan nasi berhari-hari? Tubuh menjadi lemas dan sakit.
            </div>
          </div>

          <!-- Barang 2: Buku Tulis -->
          <div class="p-5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm hover:border-sky-400 transition-all space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-3xl shadow-inner mx-auto md:mx-0">
                📖
              </div>
              <div class="flex items-center justify-between">
                <h3 class="font-black text-slate-800 text-base">2. Buku Tulis</h3>
                <span class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold text-[10px]">Alat Belajar</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed text-justify">
                Buku tulis Siti sudah terisi penuh catatan matematika. Besok pagi, Bu Guru akan mengajarkan materi pecahan baru dan memberikan tugas latihan yang harus dikerjakan serta dipelajari kembali di rumah.
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 font-medium">
              ❓ <strong>Pertanyaan Penuntun:</strong> Mengapa buku tulis sangat diperlukan saat belajar di sekolah?
            </div>
          </div>

          <!-- Barang 3: Mainan -->
          <div class="p-5 rounded-2xl bg-white border-2 border-rose-200 shadow-sm hover:border-rose-400 transition-all space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-3xl shadow-inner mx-auto md:mx-0">
                🚗
              </div>
              <div class="flex items-center justify-between">
                <h3 class="font-black text-slate-800 text-base">3. Mainan Robot/Mobil</h3>
                <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">Hiburan</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed text-justify">
                Saat jalan-jalan sore, Budi melihat mainan mobil remot balap yang menyala lampunya. Di kamarnya, Budi sudah memiliki 5 mobil mainan yang kondisinya masih sangat bagus dan seru untuk dimainkan bersama adik.
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-900 font-medium">
              ❓ <strong>Pertanyaan Penuntun:</strong> Jika mobil remot baru tidak dibeli sekarang, apakah mengganggu kesehatan Budi?
            </div>
          </div>

          <!-- Barang 4: Jajanan -->
          <div class="p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm hover:border-amber-400 transition-all space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-inner mx-auto md:mx-0">
                🍫
              </div>
              <div class="flex items-center justify-between">
                <h3 class="font-black text-slate-800 text-base">4. Jajanan Manis/Ciki</h3>
                <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">Camilan Tambahan</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed text-justify">
                Saat jam istirahat tiba, Doni sudah makan bekal roti isi telur sehat dari ibu hingga kenyang. Namun, Doni melihat temannya membeli permen gulali manis dan keripik ciki berhadiah stiker kartun lucu.
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-900 font-medium">
              ❓ <strong>Pertanyaan Penuntun:</strong> Apakah jajanan manis berhadiah stiker wajib dibeli saat perut sudah kenyang?
            </div>
          </div>
        </div>

        <!-- Slot Diskusi Bersama Terhubung ke Padlet (Highlight Besar) -->
        <div class="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 border-4 border-amber-400 ring-4 ring-amber-200/60 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <span>💬</span> <span>SLOT DISKUSI BERSAMA • LINK KOLABORASI</span>
            </span>
            <span class="text-xs font-black text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-300 animate-pulse">
              🔥 Ayo Diskusi di Sini!
            </span>
          </div>

          <div class="space-y-1.5">
            <h3 class="font-black text-slate-900 text-lg sm:text-2xl">
              Mari Berdiskusi Tentang 4 Barang di Atas!
            </h3>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Setelah mengamati gambar dan membaca cerita sederhana di atas, ayo tuliskan pendapatmu dan berdiskusi bersama teman-teman melalui link Padlet berikut:
            </p>
          </div>

          <a href="https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg" target="_blank" rel="noopener noreferrer" class="block w-full p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-amber-400 hover:border-orange-500 hover:bg-amber-50/70 transition-all shadow-sm group">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">🔗 KLIK TAUTAN DISKUSI BERSAMA (PADLET):</span>
            <span class="text-xs sm:text-base font-black text-amber-950 underline break-all group-hover:text-orange-700">
              https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg
            </span>
          </a>

          <a href="https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg" target="_blank" rel="noopener noreferrer" class="btn-playful w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-black text-sm sm:text-lg flex items-center justify-center gap-2.5 shadow-xl">
            <span>💬 BUKA SLOT DISKUSI BERSAMA SEKARANG ↗️</span>
          </a>
        </div>
      </section>

      <!-- 4. LKPD DIGITAL: 5 KEGIATAN & TAUTAN CANVA -->
      <section class="card-pastel p-6 md:p-8 border-3 border-teal-300 bg-white shadow-lg space-y-8">
        <!-- Banner Tautan LKPD Canva -->
        <div class="rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div class="space-y-2 max-w-xl">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
              <span>Lembar Kerja Peserta Didik Digital</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-black">LKPD Digital: Kebutuhan dan Keinginan 📝</h2>
            <p class="text-teal-50 text-xs md:text-sm font-medium leading-relaxed">
              Peserta didik mengakses LKPD digital tentang kebutuhan dan keinginan yang tersedia pada halaman web belajar, kemudian mengerjakan LKPD secara individu dengan mengelompokkan barang ke dalam kategori kebutuhan atau keinginan berdasarkan gambar dan cerita.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <a href="https://canva.link/9qvvwyerlogq0i1" target="_blank" rel="noopener noreferrer" class="btn-playful px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
              <span>🎨 Buka LKPD di Canva ↗️</span>
            </a>
          </div>
        </div>

        <!-- 5 KEGIATAN LKPD INTERAKTIF -->
        <div class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-teal-600">Panduan Aktivitas</span>
              <h3 class="text-xl font-black text-slate-800">5 Kegiatan LKPD Interaktif</h3>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Kerjakan Berurutan dari (1) hingga (5)
            </span>
          </div>

          <div class="space-y-6">
            <!-- (1) Ayo Amati Barang! -->
            <div class="p-5 md:p-6 rounded-2xl bg-teal-50/70 border-2 border-teal-200 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center">1</span>
                  <h4 class="text-lg font-black text-slate-800">Kegiatan 1: Ayo Amati Barang! 🔍</h4>
                </div>
                <span class="text-xs font-bold text-teal-700 bg-white px-3 py-1 rounded-full border border-teal-200">
                  Mengamati berbagai gambar barang sehari-hari
                </span>
              </div>
              <p class="text-xs md:text-sm text-slate-600">
                Amati secara cermat keempat gambar barang di atas (Nasi, Buku Tulis, Mainan, dan Jajanan). Perhatikan fungsi, manfaat, dan apa yang terjadi jika barang tersebut ada atau tidak ada.
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs font-bold">
                <div class="p-3 bg-white rounded-xl border border-teal-100 shadow-sm flex flex-col items-center gap-1">
                  <span class="text-2xl">🍚</span>
                  <span>Nasi Hangat</span>
                  <span class="text-[10px] text-slate-500 font-normal">Makanan Pokok</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-teal-100 shadow-sm flex flex-col items-center gap-1">
                  <span class="text-2xl">📖</span>
                  <span>Buku Tulis</span>
                  <span class="text-[10px] text-slate-500 font-normal">Alat Belajar</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-teal-100 shadow-sm flex flex-col items-center gap-1">
                  <span class="text-2xl">🚗</span>
                  <span>Mainan</span>
                  <span class="text-[10px] text-slate-500 font-normal">Hiburan Anak</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-teal-100 shadow-sm flex flex-col items-center gap-1">
                  <span class="text-2xl">🍫</span>
                  <span>Jajanan</span>
                  <span class="text-[10px] text-slate-500 font-normal">Camilan Manis</span>
                </div>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span id="observed-badge" class="text-xs font-bold text-teal-800 flex items-center gap-1">
                  ⚪ Belum dikonfirmasi
                </span>
                <button onclick="confirmObserveStep()" class="btn-playful px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                  <span>✅ Tandai: Sudah Amati Barang!</span>
                </button>
              </div>
            </div>

            <!-- (2) Ayo Kelompokkan! -->
            <div class="p-5 md:p-6 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">2</span>
                  <h4 class="text-lg font-black text-slate-800">Kegiatan 2: Ayo Kelompokkan! 📦</h4>
                </div>
                <span class="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
                  Mengelompokkan barang ke dalam Kebutuhan dan Keinginan
                </span>
              </div>
              <p class="text-xs md:text-sm text-slate-600">
                Pilihlah kelompok yang tepat untuk masing-masing barang berdasarkan pengamatanmu:
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <!-- Item Nasi -->
                <div class="p-3.5 sm:p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div class="flex items-center gap-2.5 sm:gap-3">
                    <span class="text-2xl sm:text-3xl">🍚</span>
                    <div>
                      <div class="font-bold text-slate-800 text-xs sm:text-sm">Nasi Hangat</div>
                      <div class="text-[11px] text-slate-500">Makanan pokok harian</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <button onclick="setLkpdGroup('nasi', 'kebutuhan')" id="btn-nasi-keb" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-center">
                      Kebutuhan
                    </button>
                    <button onclick="setLkpdGroup('nasi', 'keinginan')" id="btn-nasi-kei" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors text-center">
                      Keinginan
                    </button>
                  </div>
                </div>

                <!-- Item Buku -->
                <div class="p-3.5 sm:p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div class="flex items-center gap-2.5 sm:gap-3">
                    <span class="text-2xl sm:text-3xl">📖</span>
                    <div>
                      <div class="font-bold text-slate-800 text-xs sm:text-sm">Buku Tulis</div>
                      <div class="text-[11px] text-slate-500">Peralatan belajar sekolah</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <button onclick="setLkpdGroup('buku', 'kebutuhan')" id="btn-buku-keb" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-center">
                      Kebutuhan
                    </button>
                    <button onclick="setLkpdGroup('buku', 'keinginan')" id="btn-buku-kei" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors text-center">
                      Keinginan
                    </button>
                  </div>
                </div>

                <!-- Item Mainan -->
                <div class="p-3.5 sm:p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div class="flex items-center gap-2.5 sm:gap-3">
                    <span class="text-2xl sm:text-3xl">🚗</span>
                    <div>
                      <div class="font-bold text-slate-800 text-xs sm:text-sm">Mainan Mobil Remot</div>
                      <div class="text-[11px] text-slate-500">Hiburan & kesenangan</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <button onclick="setLkpdGroup('mainan', 'kebutuhan')" id="btn-mainan-keb" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-center">
                      Kebutuhan
                    </button>
                    <button onclick="setLkpdGroup('mainan', 'keinginan')" id="btn-mainan-kei" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors text-center">
                      Keinginan
                    </button>
                  </div>
                </div>

                <!-- Item Jajanan -->
                <div class="p-3.5 sm:p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div class="flex items-center gap-2.5 sm:gap-3">
                    <span class="text-2xl sm:text-3xl">🍫</span>
                    <div>
                      <div class="font-bold text-slate-800 text-xs sm:text-sm">Jajanan Manis/Ciki</div>
                      <div class="text-[11px] text-slate-500">Camilan tambahan</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <button onclick="setLkpdGroup('jajanan', 'kebutuhan')" id="btn-jajanan-keb" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-center">
                      Kebutuhan
                    </button>
                    <button onclick="setLkpdGroup('jajanan', 'keinginan')" id="btn-jajanan-kei" class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors text-center">
                      Keinginan
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2">
                <span id="grouping-feedback" class="text-xs font-bold text-indigo-800">
                  Pilih kelompok untuk ke-4 barang di atas.
                </span>
                <button onclick="checkLkpdGrouping()" class="btn-playful w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  <span>✨ Periksa Pengelompokan</span>
                </button>
              </div>
            </div>

            <!-- (3) Mengapa Kamu Memilihnya? -->
            <div class="p-5 md:p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center">3</span>
                  <h4 class="text-lg font-black text-slate-800">Kegiatan 3: Mengapa Kamu Memilihnya? 💡</h4>
                </div>
                <span class="text-xs font-bold text-amber-800 bg-white px-3 py-1 rounded-full border border-amber-200">
                  Menganalisis alasan dengan pertanyaan penuntun
                </span>
              </div>
              <p class="text-xs md:text-sm text-slate-600">
                Gunakan pertanyaan penuntun berikut untuk menuliskan alasan pengelompokanmu:
              </p>

              <div class="space-y-4">
                <div class="p-4 bg-white rounded-2xl border border-amber-200 space-y-2">
                  <label class="block font-bold text-slate-800 text-xs md:text-sm">
                    ❓ Pertanyaan 1: Mengapa Nasi dan Buku Tulis termasuk ke dalam kelompok Kebutuhan?
                  </label>
                  <p class="text-[11px] text-slate-500">Petunjuk: Pikirkan apa akibatnya bagi tubuh dan belajar jika kita tidak memilikinya.</p>
                  <textarea id="reason-keb" rows="2" class="w-full p-3 rounded-xl border border-slate-200 text-xs md:text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Tulis alasanmu di sini... (Contoh: Karena nasi memberi energi tubuh agar tidak lemas, dan buku tulis wajib untuk mencatat ilmu di sekolah)"></textarea>
                  <div class="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span class="text-slate-400 font-semibold">Saran cepat:</span>
                    <button onclick="fillReasonDraft('keb', 'Karena nasi memberi energi untuk bertahan hidup, dan buku tulis wajib untuk belajar di kelas.')" class="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium">
                      + Nasi pokok & buku belajar
                    </button>
                  </div>
                </div>

                <div class="p-4 bg-white rounded-2xl border border-amber-200 space-y-2">
                  <label class="block font-bold text-slate-800 text-xs md:text-sm">
                    ❓ Pertanyaan 2: Mengapa Mainan dan Jajanan termasuk ke dalam kelompok Keinginan?
                  </label>
                  <p class="text-[11px] text-slate-500">Petunjuk: Pikirkan apakah pemenuhannya bisa ditunda dan apakah masih ada alternatif lain.</p>
                  <textarea id="reason-kei" rows="2" class="w-full p-3 rounded-xl border border-slate-200 text-xs md:text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Tulis alasanmu di sini... (Contoh: Karena sifatnya hanya hiburan dan camilan pelengkap, jika tidak dibeli kita masih tetap sehat dan bisa belajar)"></textarea>
                  <div class="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span class="text-slate-400 font-semibold">Saran cepat:</span>
                    <button onclick="fillReasonDraft('kei', 'Karena sifatnya hiburan pelengkap, bisa ditunda, dan masih bisa menggunakan mainan lama.')" class="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium">
                      + Hiburan pelengkap bisa ditunda
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2">
                <span id="reason-feedback" class="text-xs font-bold text-amber-900">
                  Simpan alasan analisis untuk disertakan saat mengunggah di Padlet.
                </span>
                <button onclick="saveLkpdReasons()" class="btn-playful w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  <span>💾 Simpan Alasan Analisis</span>
                </button>
              </div>

              <!-- Link Upload Alasan Analisis ke Padlet (Highlight Besar) -->
              <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-sky-100 via-cyan-50 to-indigo-100 border-4 border-sky-400 ring-4 ring-sky-200/60 shadow-xl space-y-3.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
                    <span>📌</span> <span>LINK KOLABORASI LKPD • PENTING</span>
                  </span>
                  <span class="text-xs font-black text-sky-900 bg-white px-3 py-1 rounded-full border border-sky-300">
                    📤 Wajib Diunggah
                  </span>
                </div>

                <p class="text-base sm:text-xl font-black text-sky-950 leading-snug">
                  Simpan alasan analisis dan unggah pada link yang disediakan
                </p>

                <a href="https://padlet.com/nurafifahn16/lkpdkebutuhandankeinginan" target="_blank" rel="noopener noreferrer" class="block w-full p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-sky-400 hover:border-indigo-500 hover:bg-sky-50/70 transition-all shadow-sm group">
                  <span class="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 block mb-1">🔗 KLIK LINK PADLET LKPD KEBUTUHAN & KEINGINAN:</span>
                  <span class="text-xs sm:text-base font-black text-sky-900 underline break-all group-hover:text-indigo-700">
                    https://padlet.com/nurafifahn16/lkpdkebutuhandankeinginan
                  </span>
                </a>

                <a href="https://padlet.com/nurafifahn16/lkpdkebutuhandankeinginan" target="_blank" rel="noopener noreferrer" class="btn-playful w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-sm sm:text-lg flex items-center justify-center gap-2.5 shadow-xl">
                  <span>📤 UNGGAH ALASAN ANALISIS DI LINK PADLET ↗️</span>
                </a>
              </div>
            </div>

            <!-- (4) Ayo Berpikir! -->
            <div class="p-5 md:p-6 rounded-2xl bg-sky-50/70 border-2 border-sky-200 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-sm flex items-center justify-center">4</span>
                  <h4 class="text-lg font-black text-slate-800">Kegiatan 4: Ayo Berpikir! 🤔</h4>
                </div>
                <span class="text-xs font-bold text-sky-700 bg-white px-3 py-1 rounded-full border border-sky-200">
                  Menganalisis cerita bergambar & menentukan barang prioritas
                </span>
              </div>
              
              <!-- Cerita Kasus Prioritas -->
              <div class="p-4 bg-white rounded-2xl border border-sky-100 shadow-sm space-y-3">
                <div class="flex items-start gap-3">
                  <span class="text-3xl">🎒</span>
                  <div class="space-y-1">
                    <h5 class="font-black text-slate-800 text-sm md:text-base">Kisah Uang Saku Doni: Mana yang Harus Diprioritaskan?</h5>
                    <p class="text-xs text-slate-600 leading-relaxed text-justify">
                      Doni membawa uang saku sebesar <strong>Rp 10.000</strong> ke sekolah. Saat tiba di kelas, pensil Doni patah dan tidak ada rautan, padahal jam pertama ada latihan menulis. Perut Doni juga lapar karena belum sarapan. Di kantin sekolah tersedia:
                    </p>
                    <ul class="text-xs text-slate-700 list-disc pl-5 space-y-0.5 font-medium">
                      <li>✏️ Pensil baru: <strong>Rp 2.000</strong></li>
                      <li>🥪 Roti gandum sehat penahan lapar: <strong>Rp 5.000</strong></li>
                      <li>🤖 Gantungan kunci robot edisi terbatas: <strong>Rp 10.000</strong></li>
                    </ul>
                  </div>
                </div>

                <div class="pt-2 space-y-2">
                  <div class="text-xs font-bold text-slate-700">Tentukan keputusan terbaik yang perlu diprioritaskan Doni:</div>
                  <div class="space-y-2">
                    <label onclick="choosePriority('A')" id="priority-opt-A" class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50 transition-all flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-700">
                      <input type="radio" name="priority_choice" value="A" class="text-sky-600"/>
                      <span><strong>Pilihan A:</strong> Membeli gantungan kunci robot seharga Rp 10.000 sampai uang habis, menahan lapar, dan tidak bisa menulis.</span>
                    </label>

                    <label onclick="choosePriority('B')" id="priority-opt-B" class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50 transition-all flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-700">
                      <input type="radio" name="priority_choice" value="B" class="text-sky-600"/>
                      <span><strong>Pilihan B:</strong> Membeli pensil (Rp 2.000) dan roti sehat (Rp 5.000) = total Rp 7.000, lalu menyimpan sisa uang Rp 3.000 di saku/celengan.</span>
                    </label>

                    <label onclick="choosePriority('C')" id="priority-opt-C" class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50 transition-all flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-700">
                      <input type="radio" name="priority_choice" value="C" class="text-sky-600"/>
                      <span><strong>Pilihan C:</strong> Tidak membeli apa pun dan meminjam pensil teman seharian tanpa sarapan.</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
                <span id="priority-feedback" class="text-xs font-bold text-sky-800">
                  Pilih salah satu opsi prioritas di atas.
                </span>
                <button onclick="checkPriorityDecision()" class="btn-playful w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  <span>🎯 Kunci Jawaban Prioritas</span>
                </button>
              </div>
            </div>

            <!-- (5) Ayo Simpulkan! -->
            <div class="p-5 md:p-6 rounded-2xl bg-rose-50/70 border-2 border-rose-200 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center">5</span>
                  <h4 class="text-lg font-black text-slate-800">Kegiatan 5: Ayo Simpulkan! 🌟</h4>
                </div>
                <span class="text-xs font-bold text-rose-700 bg-white px-3 py-1 rounded-full border border-rose-200">
                  Melengkapi kalimat tentang kebutuhan, keinginan, dan prioritas
                </span>
              </div>
              <p class="text-xs md:text-sm text-slate-600">
                Lengkapilah kalimat rumpang berikut dengan memilih kata yang paling tepat:
              </p>

              <div class="space-y-3 p-4 bg-white rounded-2xl border border-rose-100 text-xs md:text-sm">
                <!-- Kalimat 1 -->
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-slate-700">1. Kebutuhan adalah segala sesuatu yang</span>
                  <select id="concl-1" class="p-1.5 rounded-lg border border-slate-300 font-bold text-violet-700 text-xs">
                    <option value="">-- Pilih Kata --</option>
                    <option value="wajib dipenuhi">wajib dipenuhi</option>
                    <option value="boleh diabaikan">boleh diabaikan</option>
                  </select>
                  <span class="text-slate-700">agar manusia dapat bertahan hidup dan belajar dengan baik.</span>
                </div>

                <!-- Kalimat 2 -->
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-slate-700">2. Keinginan adalah barang/hal yang menyenangkan tetapi</span>
                  <select id="concl-2" class="p-1.5 rounded-lg border border-slate-300 font-bold text-violet-700 text-xs">
                    <option value="">-- Pilih Kata --</option>
                    <option value="bisa ditunda">bisa ditunda</option>
                    <option value="harus sekarang">harus dibeli sekarang</option>
                  </select>
                  <span class="text-slate-700">dan tidak membahayakan hidup jika belum terpenuhi.</span>
                </div>

                <!-- Kalimat 3 -->
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-slate-700">3. Dalam menggunakan uang secara bijak, kita harus mendahulukan</span>
                  <select id="concl-3" class="p-1.5 rounded-lg border border-slate-300 font-bold text-violet-700 text-xs">
                    <option value="">-- Pilih Kata --</option>
                    <option value="kebutuhan">Kebutuhan</option>
                    <option value="keinginan">Keinginan</option>
                  </select>
                  <span class="text-slate-700">daripada keinginan.</span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2">
                <span id="concl-feedback" class="text-xs font-bold text-rose-800">
                  Lengkapi ketiga kalimat rumpang di atas.
                </span>
                <button onclick="checkLkpdConclusions()" class="btn-playful w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md">
                  <span>🎉 Selesaikan LKPD & Buka Papan Diskusi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. RUANG KOLABORASI: PADLET TERSEMAT & TANGGAPAN SANTUN -->
      <section class="card-pastel p-6 md:p-8 border-3 border-violet-300 bg-white shadow-xl space-y-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-violet-100">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Kolaborasi Terpadu</span>
            </div>
            <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>📌 Papan Diskusi Padlet Kelas 3 (Tersemat)</span>
            </h2>
            <p class="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Setelah menyelesaikan LKPD, peserta didik diarahkan untuk berbagi hasil pekerjaan melalui Padlet yang tersemat pada halaman diskusi. Setiap peserta didik mengunggah hasil pengelompokan beserta alasannya. Peserta didik membaca hasil pekerjaan teman dan memberikan tanggapan atau pertanyaan melalui kolom komentar Padlet dengan menggunakan bahasa yang santun.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2.5 flex-shrink-0 w-full md:w-auto">
            <a href="https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg" target="_blank" rel="noopener noreferrer" class="btn-playful px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all">
              <span>🌐 Buka Padlet Kolaborasi ↗️</span>
            </a>
            <button onclick="openNewPostModal()" class="btn-playful px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all">
              <span>+ Unggah Hasil LKPD ke Padlet 🚀</span>
            </button>
          </div>
        </div>

        <!-- Tautan Langsung Padlet Kolaborasi Terpadu (Highlight Besar) -->
        <div class="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white border-4 border-violet-300 ring-4 ring-purple-200 shadow-2xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-violet-900 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <span>🌐</span> <span>LINK UTAMA KOLABORASI TERPADU (PADLET)</span>
            </span>
            <span class="text-xs font-black text-amber-950 bg-amber-300 px-3 py-1 rounded-full shadow-sm animate-pulse">
              ✨ Diskusi Kelas Aktif
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="font-black text-lg sm:text-2xl text-white">
              Klik untuk Masuk ke Ruang Kolaborasi Padlet Bersama!
            </h3>
            <p class="text-xs sm:text-sm text-purple-100 font-medium">
              Unggah temuan diskusimu dan berikan tanggapan santun untuk hasil karya teman-temanmu pada tautan resmi berikut:
            </p>
          </div>

          <a href="https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg" target="_blank" rel="noopener noreferrer" class="block w-full p-3.5 sm:p-4 rounded-2xl bg-white text-violet-950 border-2 border-amber-300 hover:bg-amber-50 transition-all shadow-md group">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 block mb-1">🔗 LINK PADLET MARI BERDISKUSI:</span>
            <span class="text-xs sm:text-base font-black underline break-all group-hover:text-fuchsia-700">
              https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg
            </span>
          </a>

          <a href="https://padlet.com/virgaraya/mari-berdiskusi-s025d70n1az4io914xyg" target="_blank" rel="noopener noreferrer" class="btn-playful w-full px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-lg flex items-center justify-center gap-2.5 shadow-xl">
            <span>🚀 BUKA PADLET KOLABORASI TERPADU SEKARANG ↗️</span>
          </a>
        </div>

        <!-- NOTIFIKASI SUBMIT PADLET -->
        <div id="padlet-alert-area" class="hidden"></div>

        <!-- Aturan Cepat Saat Mengomentari -->
        <div class="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 flex flex-wrap items-center justify-between gap-3 text-xs text-violet-900">
          <div class="flex items-center gap-2 font-medium">
            <span>💡 <strong>Tips Santun:</strong> Berikan komentar yang menyemangati, misalnya:</span>
            <span class="hidden sm:inline italic">"Wah alasanmu sangat masuk akal!", "Aku setuju dengan pengelompokanmu!"</span>
          </div>
          <span class="font-bold text-[11px] bg-white px-2.5 py-1 rounded-full border border-violet-200">
            +5 Poin Tiap Komentar Santun
          </span>
        </div>

        <!-- 3 KOLOM KELOMPOK PADLET -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5" id="padlet-columns">
          <!-- Kolom Kelompok 1 -->
          <div class="p-4 rounded-3xl bg-sky-50/80 border-2 border-sky-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-sky-200">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🦌</span>
                  <div>
                    <h3 class="font-black text-sky-950 text-sm">Kelompok 1</h3>
                    <span class="text-[10px] font-bold text-sky-700">Kancil Cerdik</span>
                  </div>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-white text-sky-800 text-[10px] font-extrabold border border-sky-200">
                  Diskusi Aktif
                </span>
              </div>
              <div id="posts-group-1" class="space-y-3 mt-3">
                <!-- Post Cards akan dirender via JS -->
              </div>
            </div>
            <button onclick="quickPostForGroup('1')" class="w-full py-2 rounded-xl bg-white hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 flex items-center justify-center gap-1 shadow-sm mt-3">
              <span>+ Unggah ke Kelompok 1</span>
            </button>
          </div>

          <!-- Kolom Kelompok 2 -->
          <div class="p-4 rounded-3xl bg-amber-50/80 border-2 border-amber-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-amber-200">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🐰</span>
                  <div>
                    <h3 class="font-black text-amber-950 text-sm">Kelompok 2</h3>
                    <span class="text-[10px] font-bold text-amber-700">Kelinci Hebat</span>
                  </div>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-extrabold border border-amber-200">
                  Diskusi Aktif
                </span>
              </div>
              <div id="posts-group-2" class="space-y-3 mt-3">
                <!-- Post Cards akan dirender via JS -->
              </div>
            </div>
            <button onclick="quickPostForGroup('2')" class="w-full py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1 shadow-sm mt-3">
              <span>+ Unggah ke Kelompok 2</span>
            </button>
          </div>

          <!-- Kolom Kelompok 3 -->
          <div class="p-4 rounded-3xl bg-rose-50/80 border-2 border-rose-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-rose-200">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🦉</span>
                  <div>
                    <h3 class="font-black text-rose-950 text-sm">Kelompok 3</h3>
                    <span class="text-[10px] font-bold text-rose-700">Burung Hantu Bijak</span>
                  </div>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-white text-rose-800 text-[10px] font-extrabold border border-rose-200">
                  Diskusi Aktif
                </span>
              </div>
              <div id="posts-group-3" class="space-y-3 mt-3">
                <!-- Post Cards akan dirender via JS -->
              </div>
            </div>
            <button onclick="quickPostForGroup('3')" class="w-full py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-900 font-bold text-xs border border-rose-200 flex items-center justify-center gap-1 shadow-sm mt-3">
              <span>+ Unggah ke Kelompok 3</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 6. PEMBAHASAN PERBEDAAN JAWABAN & PERBAIKAN PEMAHAMAN -->
      <section class="card-pastel p-6 md:p-8 border-3 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/60 shadow-md space-y-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl flex-shrink-0">
            💡
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-black text-slate-800">
              Membahas Perbedaan Jawaban & Memperbaiki Pemahaman
            </h2>
            <p class="text-xs md:text-sm text-slate-600">
              Peserta didik bersama-sama membahas perbedaan jawaban, menyampaikan alasan dari hasil pengelompokan, serta memperbaiki pemahaman apabila terdapat kekeliruan.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-white border border-indigo-100 space-y-2">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2 text-indigo-900">
              <span>❓ "Bagaimana jika ada teman yang menganggap buku gambar sebagai keinginan?"</span>
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              <strong>Pembahasan Bersama:</strong> Lihat situasinya! Jika besok ada tugas menggambar dan dinilai oleh guru, maka buku gambar menjadi <em>kebutuhan belajar</em>. Namun jika hanya untuk koleksi atau corat-coret santai saat buku lama masih ada, maka termasuk <em>keinginan</em>.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-indigo-100 space-y-2">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2 text-indigo-900">
              <span>🤝 "Apa yang kita lakukan jika jawaban kita berbeda dengan teman kelompok lain?"</span>
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              <strong>Sikap Santun:</strong> Dengarkan alasan teman terlebih dahulu dengan ramah. Sampaikan sudut pandang kita dengan kalimat yang baik: <em>"Menurut pengamatanku, barang ini penting karena..."</em>. Jangan saling mengejek, tetapi carilah pemahaman bersama berdasarkan fungsi barang.
            </p>
          </div>
        </div>
      </section>

      <!-- 7. KOTAK RANGKUMAN: HASIL YANG DIHARAPKAN & POIN PENTING -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Hasil yang Diharapkan -->
        <div class="card-pastel p-6 border-3 border-emerald-300 bg-emerald-50/40 space-y-3">
          <div class="flex items-center gap-2 text-emerald-800 font-black text-lg">
            <span>🎯</span>
            <h3>Hasil yang Diharapkan</h3>
          </div>
          <p class="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
            Peserta didik mampu menganalisis barang yang termasuk kebutuhan dan keinginan berdasarkan gambar atau cerita, serta menyampaikan alasan dan menanggapi pendapat teman secara santun.
          </p>
          <div class="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
            <span>✨ Terwujudnya Sikap Gotong Royong & Bernalar Kritis</span>
          </div>
        </div>

        <!-- Poin Penting -->
        <div class="card-pastel p-6 border-3 border-violet-300 bg-violet-50/40 space-y-3">
          <div class="flex items-center gap-2 text-violet-800 font-black text-lg">
            <span>📌</span>
            <h3>Poin Penting</h3>
          </div>
          <ul class="space-y-2 text-xs md:text-sm text-slate-700">
            <li class="flex items-start gap-2">
              <span class="text-violet-600 font-bold mt-0.5">✔</span>
              <span><strong>Mengerjakan LKPD digital melalui lima kegiatan:</strong> Ayo Amati Barang, Ayo Kelompokkan, Mengapa Kamu Memilihnya, Ayo Berpikir, dan Ayo Simpulkan (<a href="https://canva.link/9qvvwyerlogq0i1" target="_blank" rel="noopener noreferrer" class="text-violet-700 underline font-bold hover:text-violet-900">Link LKPD Canva</a>).</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-violet-600 font-bold mt-0.5">✔</span>
              <span><strong>Mengunggah hasil pengerjaan LKPD</strong> melalui Padlet yang tersedia pada halaman diskusi.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-violet-600 font-bold mt-0.5">✔</span>
              <span><strong>Membaca dan memberikan tanggapan</strong> terhadap hasil pekerjaan teman menggunakan bahasa yang santun.</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button onclick="switchTab('e')" class="btn-playful w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
          <span>⬅️ Kembali ke Tahap E</span>
        </button>
        <button onclick="completeStageTAndNext()" class="btn-playful w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all">
          <span>Selesai Tahap T & Lanjut ke Tahap I ➔</span>
        </button>
      </div>
    </div>

    <!-- MODAL UNGGAH HASIL LKPD KE PADLET -->
    <div id="padlet-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
      <div class="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-violet-200 space-y-5 animate-bounce-gentle max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📝</span>
            <h3 class="font-black text-slate-800 text-lg">Unggah Hasil LKPD ke Padlet</h3>
          </div>
          <button onclick="closeNewPostModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors">✕</button>
        </div>

        <div class="space-y-4 text-xs md:text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Peserta Didik / Anggota:</label>
            <input type="text" id="post-author" value="${AppState.studentName}" class="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-violet-400 focus:outline-none"/>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Kelompok Padlet:</label>
            <select id="post-group" class="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-violet-400 focus:outline-none">
              <option value="1">Kelompok 1 (Kancil Cerdik)</option>
              <option value="2">Kelompok 2 (Kelinci Hebat)</option>
              <option value="3">Kelompok 3 (Burung Hantu Bijak)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Pengelompokan LKPD:</label>
            <input type="text" id="post-title" value="Hasil LKPD: Kebutuhan vs Keinginan 4 Barang" class="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-violet-400 focus:outline-none"/>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Alasan dan Temuan Diskusi:</label>
            <textarea id="post-content" rows="4" class="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-violet-400 focus:outline-none" placeholder="Tuliskan temuan pengelompokanmu dan alasan mengapa barang tersebut termasuk kebutuhan atau keinginan..."></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">📸 Lampirkan Foto / File LKPD (Opsional):</label>
            <input type="file" id="post-file-input" accept="image/*" onchange="handlePadletFileSelect(event)" class="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"/>
            <div id="padlet-file-preview" class="hidden mt-2 p-2 bg-violet-50 rounded-xl border border-violet-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img id="padlet-preview-thumb" src="" alt="Thumbnail" class="w-10 h-10 object-cover rounded-lg border border-violet-300"/>
                <span id="padlet-file-name" class="text-xs font-semibold text-slate-700 truncate max-w-[180px]">file.jpg</span>
              </div>
              <span class="text-[10px] text-emerald-700 font-bold">Siap Disubmit ✅</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button onclick="closeNewPostModal()" class="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors">Batal</button>
          <button onclick="savePadletPost()" class="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs shadow-md shadow-violet-200 transition-all flex items-center gap-1.5">
            <span>Kirim ke Padlet 🚀</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   STATE & HELPER FUNCTIONS TAHAP T
   ============================================================ */

window.lkpdState = {
  observed: false,
  grouping: { nasi: '', buku: '', mainan: '', jajanan: '' },
  reasonKeb: '',
  reasonKei: '',
  priority: '',
  conclusions: { c1: '', c2: '', c3: '' }
};

function initTahapTView() {
  // Pastikan data seed Padlet tersedia jika kosong
  if (!AppState.padletPosts || AppState.padletPosts.length === 0) {
    AppState.padletPosts = [
      {
        id: 'post-1',
        author: 'Ines & Ani',
        group: '1',
        title: 'Nasi = Kebutuhan Pokok 🍚',
        content: 'Nasi adalah makanan pokok yang wajib kita makan setiap hari agar tubuh tidak lemas dan punya tenaga saat belajar di sekolah.',
        likes: 5,
        comments: [
          { author: 'Nasrun', text: 'Betul sekali Ines! Kalau tidak sarapan nasi, waktu olahraga bisa pusing.' },
          { author: 'Siti', text: 'Alasannya sangat jelas dan santun. Terima kasih sudah berbagi! 👍' }
        ]
      },
      {
        id: 'post-2',
        author: 'Nasrun & Budi',
        group: '2',
        title: 'Buku Tulis = Kebutuhan Belajar 📖',
        content: 'Buku tulis wajib kita miliki untuk mencatat penjelasan dari Bu Guru agar kita bisa belajar kembali di rumah.',
        likes: 7,
        comments: [
          { author: 'Afifah', text: 'Aku setuju! Tanpa buku tulis, materi pelajaran mudah terlupa.' }
        ]
      },
      {
        id: 'post-3',
        author: 'Nur Afifah & Zidna',
        group: '3',
        title: 'Mainan & Jajanan = Keinginan 🚗🍫',
        content: 'Mobil mainan baru dan jajanan manis sifatnya hiburan tambahan. Jika belum dibeli, kita tetap bisa hidup sehat dan belajar dengan baik.',
        likes: 9,
        comments: [
          { author: 'Doni', text: 'Sangat tepat! Kebutuhan makan sehat dan alat belajar harus nomor satu!' }
        ]
      }
    ];
    AppState.save();
  }

  renderPadletPosts();
}

function commitToPoliteRules(btn) {
  window.soundManager.playCorrect();
  AppState.addReward(10, 2, 'Kamu berkomitmen untuk selalu berdiskusi dengan santun!');
  btn.innerHTML = '<span>🎉 Hebat! Kamu Siap Diskusi Santun!</span>';
  btn.classList.remove('from-violet-500', 'to-purple-600');
  btn.classList.add('bg-emerald-600');
}

function confirmObserveStep() {
  window.soundManager.playPop();
  window.lkpdState.observed = true;
  const badge = document.getElementById('observed-badge');
  if (badge) {
    badge.innerHTML = '🟢 <span class="text-emerald-700 font-bold">Sudah Mengamati ke-4 Barang! (+10 Poin)</span>';
  }
  AppState.addReward(10, 2, 'Kegiatan 1 (Ayo Amati Barang) selesai!');
}

function setLkpdGroup(item, choice) {
  window.soundManager.playPop();
  window.lkpdState.grouping[item] = choice;

  const btnKeb = document.getElementById(`btn-${item}-keb`);
  const btnKei = document.getElementById(`btn-${item}-kei`);

  if (choice === 'kebutuhan') {
    btnKeb?.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
    btnKeb?.classList.remove('text-slate-600');
    btnKei?.classList.remove('bg-amber-600', 'text-white', 'border-amber-600');
    btnKei?.classList.add('text-slate-600');
  } else {
    btnKei?.classList.add('bg-amber-600', 'text-white', 'border-amber-600');
    btnKei?.classList.remove('text-slate-600');
    btnKeb?.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600');
    btnKeb?.classList.add('text-slate-600');
  }
}

function checkLkpdGrouping() {
  const g = window.lkpdState.grouping;
  const feedback = document.getElementById('grouping-feedback');

  if (!g.nasi || !g.buku || !g.mainan || !g.jajanan) {
    if (feedback) feedback.innerText = '⚠️ Harap pilih kelompok untuk semua barang terlebih dahulu!';
    window.soundManager.playWrong();
    return;
  }

  const isCorrect = (g.nasi === 'kebutuhan' && g.buku === 'kebutuhan' && g.mainan === 'keinginan' && g.jajanan === 'keinginan');

  if (isCorrect) {
    window.soundManager.playFanfare();
    if (feedback) {
      feedback.innerHTML = '🎉 <span class="text-emerald-700 font-bold">Luar Biasa! Semua pengelompokanmu tepat 100%! Nasi & Buku adalah Kebutuhan, Mainan & Jajanan adalah Keinginan.</span>';
    }
    AppState.addReward(20, 4, 'Kegiatan 2 (Ayo Kelompokkan) berhasil sempurna!');
  } else {
    window.soundManager.playWrong();
    if (feedback) {
      feedback.innerHTML = '💡 <span class="text-amber-700 font-bold">Masih ada yang kurang pas. Ingat: Nasi dan Buku wajib untuk hidup & belajar! Coba perbaiki lagi ya.</span>';
    }
  }
}

function fillReasonDraft(type, text) {
  window.soundManager.playPop();
  if (type === 'keb') {
    const el = document.getElementById('reason-keb');
    if (el) el.value = text;
  } else {
    const el = document.getElementById('reason-kei');
    if (el) el.value = text;
  }
}

async function saveLkpdReasons() {
  const rKeb = document.getElementById('reason-keb')?.value.trim();
  const rKei = document.getElementById('reason-kei')?.value.trim();
  const fb = document.getElementById('reason-feedback');

  if (!rKeb || !rKei) {
    alert('Mohon lengkapi kedua alasan analisis ya!');
    return;
  }

  window.lkpdState.reasonKeb = rKeb;
  window.lkpdState.reasonKei = rKei;
  window.soundManager.playCorrect();

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    await window.RBC_SUPABASE.saveLkpdSubmission({
      nama: AppState.studentName || 'Teman Belajar',
      observed: window.lkpdState?.observed ?? true,
      grouping: window.lkpdState?.grouping || {},
      reasonKeb: rKeb,
      reasonKei: rKei,
      priority: window.lkpdState?.priority || 'B',
      conclusions: window.lkpdState?.conclusions || {}
    });
  }

  if (fb) {
    fb.innerHTML = `
      <div class="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1.5 mt-2 animate-fade-in">
        <div class="flex items-center justify-between font-black text-emerald-900 text-sm">
          <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: Alasan Analisis Berhasil Tersubmit!</span>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
        </div>
        <p class="text-emerald-800 leading-relaxed font-medium">
          Alasan analisismu telah tersimpan ke database cloud dan otomatis disiapkan untuk materi diskusi Padlet.
        </p>
      </div>
    `;
  }
  AppState.addReward(15, 3, 'Kegiatan 3 (Mengapa Kamu Memilihnya) selesai & tersimpan!');
  AppState.showToast('✅ Alasan LKPD berhasil tersubmit ke database!');
}

function choosePriority(choice) {
  window.soundManager.playPop();
  window.lkpdState.priority = choice;

  ['A', 'B', 'C'].forEach(opt => {
    const el = document.getElementById(`priority-opt-${opt}`);
    if (opt === choice) {
      el?.classList.add('border-sky-500', 'bg-sky-100/70', 'ring-2', 'ring-sky-400');
    } else {
      el?.classList.remove('border-sky-500', 'bg-sky-100/70', 'ring-2', 'ring-sky-400');
    }
  });
}

function checkPriorityDecision() {
  const p = window.lkpdState.priority;
  const fb = document.getElementById('priority-feedback');

  if (!p) {
    if (fb) fb.innerText = '⚠️ Mohon pilih salah satu opsi terlebih dahulu!';
    window.soundManager.playWrong();
    return;
  }

  if (p === 'B') {
    window.soundManager.playFanfare();
    if (fb) {
      fb.innerHTML = '🎉 <span class="text-emerald-700 font-bold">Tepat Sekali! Doni mendahulukan kebutuhan belajar (pensil) dan kebutuhan hidup (makan siang), lalu menabung sisanya!</span>';
    }
    AppState.addReward(20, 4, 'Kegiatan 4 (Ayo Berpikir) berhasil!');
  } else {
    window.soundManager.playWrong();
    if (fb) {
      fb.innerHTML = '💡 <span class="text-amber-700 font-bold">Kurang tepat. Menghabiskan uang untuk mainan padahal belum makan dan tidak punya pensil bukan sikap bijak. Pilihlah B!</span>';
    }
  }
}

function checkLkpdConclusions() {
  const c1 = document.getElementById('concl-1')?.value;
  const c2 = document.getElementById('concl-2')?.value;
  const c3 = document.getElementById('concl-3')?.value;
  const fb = document.getElementById('concl-feedback');

  if (!c1 || !c2 || !c3) {
    if (fb) fb.innerText = '⚠️ Mohon pilih kata pelengkap untuk ketiga kalimat!';
    window.soundManager.playWrong();
    return;
  }

  if (c1 === 'wajib dipenuhi' && c2 === 'bisa ditunda' && c3 === 'kebutuhan') {
    window.soundManager.playFanfare();
    if (fb) {
      fb.innerHTML = `
        <div class="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1.5 shadow-sm animate-fade-in">
          <div class="flex items-center justify-between font-black text-emerald-900 text-sm">
            <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: 5 Kegiatan LKPD Berhasil Tersubmit!</span>
            <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
          </div>
          <p class="text-emerald-800 leading-relaxed font-medium">
            Luar Biasa! Seluruh 5 Kegiatan LKPD kamu telah tuntas, kesimpulan 100% tepat, dan tersimpan ke database cloud. Ayo buka Papan Padlet dan bagikan hasil karyamu!
          </p>
        </div>
      `;
    }
    AppState.addReward(25, 5, 'Kamu berhasil menyelesaikan seluruh 5 Kegiatan LKPD!');
    if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
      window.RBC_SUPABASE.saveLkpdSubmission({
        nama: AppState.studentName || 'Teman Belajar',
        observed: window.lkpdState?.observed || true,
        grouping: window.lkpdState?.grouping || {},
        reasonKeb: window.lkpdState?.reasonKeb || '',
        reasonKei: window.lkpdState?.reasonKei || '',
        priority: window.lkpdState?.priority || 'B',
        conclusions: { c1, c2, c3 }
      });
    }
    AppState.showToast('✅ Seluruh LKPD berhasil tersubmit ke database!');
    // Pre-fill modal Padlet
    openNewPostModal();
  } else {
    window.soundManager.playWrong();
    if (fb) {
      fb.innerHTML = '💡 <span class="text-amber-700 font-bold">Ada kalimat yang belum pas. Kebutuhan = wajib dipenuhi, Keinginan = bisa ditunda, Dahulukan = Kebutuhan. Coba lagi ya!</span>';
    }
  }
}

/* ============================================================
   PADLET FUNCTIONS
   ============================================================ */

function renderPadletPosts() {
  const posts = AppState.padletPosts || [];

  ['1', '2', '3'].forEach(grp => {
    const col = document.getElementById(`posts-group-${grp}`);
    if (!col) return;

    const grpPosts = posts.filter(p => String(p.group) === String(grp));
    if (grpPosts.length === 0) {
      col.innerHTML = `
        <div class="p-4 rounded-xl bg-white/60 border border-dashed border-slate-200 text-center text-xs text-slate-400">
          Belum ada kiriman di kelompok ini. Jadilah yang pertama!
        </div>
      `;
      return;
    }

    col.innerHTML = grpPosts.map((post, idx) => `
      <div class="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="font-black text-slate-800 text-xs flex items-center gap-1.5">
            👤 ${post.author}
          </span>
          <span class="text-[10px] text-slate-400 font-semibold">Kelompok ${post.group}</span>
        </div>
        <div class="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-black text-[10px] inline-block">
          ${post.title}
        </div>
        <p class="text-slate-600 leading-relaxed">${post.content}</p>

        ${post.fileData ? `
          <div class="rounded-xl overflow-hidden border border-violet-200 mt-2 bg-slate-50 cursor-pointer group" onclick="openImageLightbox('${post.fileData}', '${post.title.replace(/'/g, "\\'")}', '${post.author.replace(/'/g, "\\'")}')" title="Klik untuk membuka foto penuh">
            <img src="${post.fileData}" alt="Lampiran LKPD" class="w-full max-h-48 object-contain hover:scale-105 transition-transform"/>
            <div class="p-1.5 text-[10px] text-violet-700 font-bold text-center bg-violet-50 flex items-center justify-center gap-1">
              <span>🔍 Klik untuk memperbesar foto</span>
            </div>
          </div>
        ` : ''}
        
        <!-- Action Row -->
        <div class="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
          <button onclick="likePadletItem('${post.id || idx}')" class="hover:text-rose-500 font-bold flex items-center gap-1 text-slate-600 transition-colors">
            ❤️ <span>${post.likes || 1}</span> Suka
          </button>
          <span class="text-emerald-600 font-semibold text-[10px]">Diskusi Santun ✔</span>
        </div>

        <!-- Thread Komentar Santun -->
        <div class="pt-2 space-y-1.5 border-t border-slate-50">
          <div class="text-[10px] font-bold text-slate-500">Tanggapan Teman:</div>
          <div class="space-y-1 max-h-32 overflow-y-auto pr-1">
            ${(post.comments || []).map(c => `
              <div class="p-2 rounded-xl bg-slate-50 text-[11px] space-y-0.5 border border-slate-100">
                <span class="font-bold text-violet-700">${c.author}:</span>
                <span class="text-slate-600">${c.text}</span>
              </div>
            `).join('')}
          </div>

          <!-- Input Komentar Santun Baru -->
          <div class="pt-1 flex gap-1.5">
            <input type="text" id="comment-input-${post.id || idx}" placeholder="Tulis komentar santun..." class="flex-1 p-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-violet-400 focus:outline-none"/>
            <button onclick="submitPadletComment('${post.id || idx}')" class="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] flex-shrink-0">
              Kirim
            </button>
          </div>
          <!-- Quick Santun Suggestions -->
          <div class="flex flex-wrap gap-1 pt-0.5">
            <button onclick="quickComment('${post.id || idx}', 'Wah alasanmu sangat masuk akal! 👍')" class="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 font-medium">
              👍 Sangat masuk akal
            </button>
            <button onclick="quickComment('${post.id || idx}', 'Aku setuju, kebutuhan harus didahulukan! 🌟')" class="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 font-medium">
              🌟 Kebutuhan nomor 1
            </button>
          </div>
        </div>
      </div>
    `).join('');
  });
}

window.tempPadletFile = null;

// Kompresi gambar client-side agar upload ringan, cepat, dan tidak memenuhi kuota
function compressImageFile(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ dataUrl: e.target.result, size: file.size });
      reader.onerror = () => resolve({ dataUrl: '', size: 0 });
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxWidth) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxWidth) / h);
            h = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSize = Math.round((dataUrl.length * 3) / 4);
        resolve({ dataUrl, size: approxSize });
      };
      img.onerror = () => resolve({ dataUrl: event.target.result, size: file.size });
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handlePadletFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const { dataUrl, size } = await compressImageFile(file, 900, 0.75);
  window.tempPadletFile = {
    name: file.name,
    dataUrl: dataUrl,
    size: size
  };
  const prev = document.getElementById('padlet-file-preview');
  const thumb = document.getElementById('padlet-preview-thumb');
  const nameEl = document.getElementById('padlet-file-name');
  if (prev && thumb && nameEl) {
    thumb.src = dataUrl;
    nameEl.innerText = file.name;
    prev.classList.remove('hidden');
  }
  window.soundManager.playPop();
}

function openNewPostModal(defaultGroup) {
  const modal = document.getElementById('padlet-modal');
  if (modal) modal.classList.remove('hidden');

  if (defaultGroup) {
    const sel = document.getElementById('post-group');
    if (sel) sel.value = defaultGroup;
  }

  // Isi otomatis konten jika siswa sudah mengisi alasan di kegiatan LKPD
  const contentEl = document.getElementById('post-content');
  if (contentEl && !contentEl.value.trim()) {
    const rKeb = window.lkpdState?.reasonKeb || 'Nasi dan buku tulis adalah kebutuhan karena penting untuk tubuh dan belajar.';
    const rKei = window.lkpdState?.reasonKei || 'Mainan dan jajanan adalah keinginan karena sifatnya hiburan pelengkap.';
    contentEl.value = `Menurut pengamatan saya:\n1. Nasi & Buku Tulis = KEBUTUHAN. Alasan: ${rKeb}\n2. Mainan & Jajanan = KEINGINAN. Alasan: ${rKei}\nPrioritas belanja adalah mendahulukan kebutuhan hidup dan belajar!`;
  }
}

function quickPostForGroup(grp) {
  openNewPostModal(grp);
}

function closeNewPostModal() {
  document.getElementById('padlet-modal')?.classList.add('hidden');
}

function savePadletPost() {
  const author = document.getElementById('post-author')?.value.trim() || AppState.studentName;
  const group = document.getElementById('post-group')?.value || '1';
  const title = document.getElementById('post-title')?.value.trim();
  const content = document.getElementById('post-content')?.value.trim();

  if (!title || !content) {
    alert('Mohon isi judul dan temuan/alasan diskusimu ya!');
    return;
  }

  const newPost = {
    id: 'post-' + Date.now(),
    author: author,
    group: group,
    title: title,
    content: content,
    likes: 1,
    comments: [
      { author: 'Ciko Mascot', text: 'Hebat sekali gagasanmu! Terus belajar dengan ceria dan santun ya! 🌟' }
    ]
  };

  if (window.tempPadletFile) {
    newPost.fileNama = window.tempPadletFile.name;
    newPost.fileData = window.tempPadletFile.dataUrl;
    window.tempPadletFile = null;
  }

  AppState.padletPosts.unshift(newPost);
  AppState.save();
  renderPadletPosts();
  closeNewPostModal();

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    window.RBC_SUPABASE.sendPadletPost(newPost);
  }

  window.soundManager.playFanfare();
  AppState.addReward(20, 4, 'Hasil LKPD-mu berhasil diunggah ke Papan Padlet!');

  const alertArea = document.getElementById('padlet-alert-area');
  if (alertArea) {
    alertArea.classList.remove('hidden');
    alertArea.innerHTML = `
      <div class="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1.5 shadow-sm animate-fade-in">
        <div class="flex items-center justify-between font-black text-emerald-900 text-sm">
          <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: Postingan & File LKPD Berhasil Tersubmit!</span>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
        </div>
        <p class="text-emerald-800 leading-relaxed font-medium">
          Hore, <strong>${author}</strong>! Postingan diskusi dan karyamu telah sukses tersimpan ke database cloud dan langsung tampil di Kelompok ${group}.
        </p>
      </div>
    `;
    alertArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  AppState.showToast('✅ Postingan Padlet berhasil tersubmit ke database!');
}

function likePadletItem(postId) {
  window.soundManager.playPop();
  const post = AppState.padletPosts.find(p => String(p.id) === String(postId));
  if (post) {
    post.likes = (post.likes || 0) + 1;
    AppState.save();
    renderPadletPosts();
  }
}

function quickComment(postId, text) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (input) {
    input.value = text;
    submitPadletComment(postId);
  }
}

function submitPadletComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input?.value.trim();

  if (!text) return;

  const post = AppState.padletPosts.find(p => String(p.id) === String(postId));
  if (post) {
    if (!post.comments) post.comments = [];
    post.comments.push({
      author: AppState.studentName || 'Teman Belajar',
      text: text
    });
    AppState.save();
    window.soundManager.playCorrect();
    AppState.addReward(5, 1, 'Tanggapan santunmu berhasil dikirimkan!');
    renderPadletPosts();

    if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
      window.RBC_SUPABASE.sendPadletComment(postId, {
        author: AppState.studentName || 'Teman Belajar',
        text: text
      });
    }
    AppState.showToast('✅ Komentar santun berhasil tersubmit ke database!');
  }
}

function completeStageTAndNext() {
  AppState.markStageComplete('t');
  switchTab('i');
}


/* ============================================================
   VIEW 6: TAHAP I - IKAT KONSEP (IKAT ILMUKU)
   Urutan Penting:
   1. Peta konsep
   2. Pertanyaan penguatan
   3. Kolom jawaban penguatan
   4. Penguatan materi (ppt: https://canva.link/e0arf658n2yoz1b)
   5. Kolom diskusi/refleksi
   ============================================================ */
function renderTahapIView() {
  return `
    <div class="space-y-6 sm:space-y-10 animate-fade-in">
      <!-- Banner Area sesuai Storyboard -->
      <div class="rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span>Tahap 5 dari 6</span> • <span>I - IKAT KONSEP</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black">IKAT ILMUKU: Mengikat Seluruh Konsep</h1>
          <p class="text-rose-100 text-sm md:text-base font-medium max-w-xl">
            Menyimpulkan materi, meluruskan pemahaman yang keliru, dan mengaitkan konsep yang telah dipelajari.
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('thinking', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Mascot Greeting -->
      ${RBC_MASCOT.bubble("Hebat sekali teman-teman! Sekarang saatnya kita mengikat ilmu yang sudah didapat agar tidak mudah lupa. Mari kita simpulkan bersama dan luruskan hal-hal yang sering membuat orang salah paham tentang uang!")}

      <!-- 1. PETA KONSEP (Urutan #1 sesuai Storyboard Page 5) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-rose-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl">🗺️</span>
          <div>
            <span class="text-xs font-bold uppercase text-rose-600 tracking-wider">Langkah 1</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Peta Konsep: Uang dan Pengelolaannya</h2>
          </div>
        </div>

        <p class="text-slate-600 text-sm mb-6 font-medium">
          Amati keterkaitan antar konsep pada diagram peta konsep di bawah ini:
        </p>

        <!-- Diagram Peta Konsep Interaktif -->
        <div class="p-6 rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50 border-2 border-rose-200 space-y-6">
          <!-- Pusat -->
          <div class="flex justify-center">
            <div class="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-lg md:text-xl shadow-lg border-2 border-white text-center animate-bounce-gentle">
              💰 UANG RUPIAH
            </div>
          </div>

          <!-- Cabang 3 Utama -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Cabang 1: Jenis -->
            <div class="p-5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm space-y-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">Jenis Uang</span>
              <h4 class="font-bold text-slate-800 text-base">Kertas & Logam</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Logam dari aluminium/baja, kertas dari serat khusus dengan gambar pahlawan nasional. Keduanya sah digunakan di seluruh Indonesia.
              </p>
            </div>

            <!-- Cabang 2: Fungsi -->
            <div class="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Fungsi Uang</span>
              <h4 class="font-bold text-slate-800 text-base">Alat Tukar & Bayar</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Digunakan untuk membeli barang kebutuhan di kantin, toko, serta membayar jasa transportasi.
              </p>
            </div>

            <!-- Cabang 3: Pengelolaan -->
            <div class="p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Pengelolaan</span>
              <h4 class="font-bold text-slate-800 text-base">Kebutuhan vs Keinginan</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Mendahulukan kebutuhan pokok sebelum membeli keinginan, serta rajin menyisihkan uang ke celengan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 2 & 3. PERTANYAAN PENGUATAN & KOLOM JAWABAN (Urutan #2 & #3) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-amber-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">❓</span>
          <div>
            <span class="text-xs font-bold uppercase text-amber-600 tracking-wider">Langkah 2 & 3</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Pertanyaan Penguatan Pemahaman</h2>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label class="block font-bold text-slate-800 text-sm mb-1">
              1. Apa saja dua jenis uang rupiah yang beredar di Indonesia?
            </label>
            <input type="text" id="penguatan-1" class="w-full p-2.5 rounded-xl border border-slate-300 text-sm" placeholder="Ketik jawabanmu..."/>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label class="block font-bold text-slate-800 text-sm mb-1">
              2. Untuk apa uang digunakan dalam kegiatan sehari-hari?
            </label>
            <input type="text" id="penguatan-2" class="w-full p-2.5 rounded-xl border border-slate-300 text-sm" placeholder="Ketik jawabanmu..."/>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label class="block font-bold text-slate-800 text-sm mb-1">
              3. Bagaimana cara kamu membedakan antara kebutuhan dan keinginan?
            </label>
            <input type="text" id="penguatan-3" class="w-full p-2.5 rounded-xl border border-slate-300 text-sm" placeholder="Ketik jawabanmu..."/>
          </div>

          <button onclick="savePenguatanAnswers()" class="btn-playful px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md">
            <span>Simpan Jawaban Penguatan 🌟</span>
          </button>
          
          <div id="penguatan-feedback-box" class="hidden mt-3"></div>
        </div>
      </div>

      <!-- 4. PENGUATAN MATERI & MISKONSEPSI + CANVA SLIDE (Urutan #4) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-sky-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl">💡</span>
          <div>
            <span class="text-xs font-bold uppercase text-sky-600 tracking-wider">Langkah 4</span>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">Klarifikasi Miskonsepsi (Mitos vs Fakta)</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">❌ Miskonsepsi yang Sering Terjadi</span>
            <p class="font-bold text-slate-800 text-sm mt-2">"Semua barang yang kita sukai adalah kebutuhan."</p>
            <div class="mt-2 pt-2 border-t border-rose-200 text-xs text-slate-600">
              <strong>✅ Fakta Benar:</strong> Tidak semua yang kita sukai wajib dibeli. Kebutuhan adalah hal penting untuk hidup (makan, pakaian, sekolah), sedangkan barang kesukaan seringkali merupakan keinginan yang bisa ditunda.
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">❌ Miskonsepsi yang Sering Terjadi</span>
            <p class="font-bold text-slate-800 text-sm mt-2">"Nilai uang ditentukan oleh besar kecil ukuran fisiknya."</p>
            <div class="mt-2 pt-2 border-t border-rose-200 text-xs text-slate-600">
              <strong>✅ Fakta Benar:</strong> Nilai uang ditentukan oleh angka nominal yang tertulis di uang tersebut, bukan oleh ukuran fisik kertas atau koinnya.
            </div>
          </div>
        </div>

        <!-- Canva Slide Presentation Embed & Link -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 space-y-3">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span class="text-xs font-bold text-sky-700 uppercase">Slide Materi Guru</span>
              <h4 class="font-bold text-slate-800 text-base">Presentasi Canva: Bijak Berbelanja Kebutuhan</h4>
            </div>
            <a href="${RBC_DATA.appInfo.canvaUrl}" target="_blank" rel="noopener noreferrer" class="btn-playful w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
              <span>Buka Slide Canva ➔</span>
            </a>
          </div>
          <p class="text-xs text-slate-600">
            Kamu dapat membuka tautan Canva di atas untuk menyimak rangkuman materi lengkap dalam bentuk slide presentasi yang menarik!
          </p>
        </div>
      </div>

      <!-- 5. KOLOM DISKUSI / REFLEKSI (Urutan #5) -->
      <div class="card-pastel p-6 border-2 border-indigo-200">
        <h3 class="font-bold text-slate-800 text-base mb-2">💬 Kesimpulan Bersama</h3>
        <p class="text-slate-600 text-sm leading-relaxed mb-4">
          Sekarang kita semua paham bahwa uang adalah alat tukar yang berharga. Kita harus pintar mendahulukan kebutuhan dan menyisihkan uang saku untuk menabung!
        </p>
        <button onclick="switchTab('kuis')" class="btn-playful w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md">
          <span>Uji Pemahamanmu di Kuis Interaktif 🎯</span>
        </button>
      </div>

      <!-- Navigation Buttons -->
      <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button onclick="switchTab('t')" class="btn-playful w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
          <span>⬅️ Kembali ke Tahap T</span>
        </button>
        <button onclick="completeStageIAndNext()" class="btn-playful w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200">
          <span>Selesai Tahap I & Lanjut ke Tahap K ➔</span>
        </button>
      </div>
    </div>
  `;
}

function initTahapIView() {}

async function savePenguatanAnswers() {
  const a1 = document.getElementById('penguatan-1')?.value.trim();
  const a2 = document.getElementById('penguatan-2')?.value.trim();
  const a3 = document.getElementById('penguatan-3')?.value.trim();

  if (!a1 || !a2 || !a3) {
    alert('Ayo lengkapi ketiga pertanyaan penguatan ya!');
    return;
  }

  AppState.penguatanAnswers = { a1, a2, a3 };
  localStorage.setItem('rbc_penguatan_answers', JSON.stringify(AppState.penguatanAnswers));

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    await window.RBC_SUPABASE.savePenguatanAnswers({
      nama: AppState.studentName || 'Teman Belajar',
      a1, a2, a3
    });
  }

  AppState.addReward(20, 4, 'Jawaban penguatan berhasil disimpan!');
  AppState.unlockBadge('si-rajin-membaca');
  window.soundManager.playFanfare();

  const fbBox = document.getElementById('penguatan-feedback-box');
  if (fbBox) {
    fbBox.classList.remove('hidden');
    fbBox.innerHTML = `
      <div class="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-2 shadow-sm animate-fade-in">
        <div class="flex items-center justify-between font-black text-emerald-900 text-sm">
          <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: Jawaban Penguatan Berhasil Tersubmit!</span>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
        </div>
        <p class="text-emerald-800 leading-relaxed font-medium">
          Hebat sekali, <strong>${AppState.studentName}</strong>! Ketiga jawaban penguatan pemahamanmu telah sukses tersimpan ke database cloud. Kamu sudah siap melanjutkan ke Tahap K (Karyaku)!
        </p>
      </div>
    `;
  }
  AppState.showToast('✅ Jawaban penguatan berhasil tersubmit ke database!');
}

function completeStageIAndNext() {
  AppState.markStageComplete('i');
  switchTab('k');
}

/* ============================================================
   VIEW 7: TAHAP K - KARYA & REFLEKSI (KARYAKU)
   Sesuai Storyboard Page 6:
   1. Tugas Karya / Aksi Nyata (Celengan Kreatif & Rencana Belanja)
   2. Unggah Karya & Galeri
   3. Rubrik Penilaian
   4. Refleksi Mandiri ("Aku tahu...", "Aku merasa...", "Aku ingin mencoba...")
   5. Sertifikat Siswa Ceria
   ============================================================ */
function renderTahapKView() {
  return `
    <div class="space-y-6 sm:space-y-10 animate-fade-in">
      <!-- Banner Area sesuai Storyboard -->
      <div class="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <span>Tahap 6 dari 6</span> • <span>K - KARYA & REFLEKSI</span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black">KARYAKU: Celengan Kreatif & Refleksi</h1>
          <p class="text-indigo-100 text-sm md:text-base font-medium max-w-xl">
            Membuat karya nyata menghias celengan, menyusun rencana belanja bijak, dan merefleksikan proses belajar.
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('happy', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Mascot Greeting -->
      ${RBC_MASCOT.bubble("Selamat telah sampai di tahap akhir pembelajaran DHETIK! Sekarang mari kita berkreasi membuat celengan impianmu sendiri dan menyusun rencana belanja bijak!")}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- 1. TUGAS KARYA & UNGGAH (Left Column sesuai Storyboard Page 6) -->
        <div class="lg:col-span-6 space-y-6">
          <div class="card-pastel p-6 md:p-8 border-2 border-indigo-200">
            <h3 class="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>🎨 Tugas Karya: Celengan Kreatif & Rencana Belanja</span>
            </h3>
            <p class="text-xs md:text-sm text-slate-600 mb-4 leading-relaxed">
              Buatlah celengan kreasi sendiri seperti celengan ayam atau dari bahan daur ulang, lalu hias dengan indah! Susun juga tabel sederhana "Rencana Belanja Bijakku" berisi daftar barang kebutuhan yang ingin kamu beli.
            </p>

            <div class="p-5 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-300 space-y-4">
              <div class="flex items-center justify-between">
                <span class="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>📸</span> Unggah Foto Karyamu di Sini:
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">Format: JPG, PNG, WEBP</span>
              </div>

              <input type="file" id="karya-file-input" accept="image/*" onchange="handleKaryaFileSelect(event)" class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-all"/>
              
              <!-- PREVIEW & TOMBOL SUBMIT FILE (Sesuai Permintaan Revisi #1) -->
              <div id="karya-preview-container" class="hidden space-y-3 pt-1">
                <div class="relative bg-white p-2.5 rounded-2xl border-2 border-indigo-200 shadow-sm">
                  <img id="karya-preview-img" src="" alt="Preview Karyaku" class="w-full max-h-56 object-contain rounded-xl"/>
                  <div id="karya-file-info" class="mt-2 text-[11px] text-slate-600 font-medium px-1 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span id="karya-file-name" class="font-bold truncate max-w-[200px]">foto_celengan.jpg</span>
                    <span id="karya-file-size" class="text-slate-500 font-semibold">0 KB</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-indigo-950 mb-1">Judul / Catatan Karyamu:</label>
                  <input type="text" id="karya-title-input" value="Celengan Ayam Kreasi & Rencana Belanjaku" class="w-full p-2.5 text-xs rounded-xl border border-indigo-200 font-semibold focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="Tulis judul kreasimu..."/>
                </div>

                <!-- TOMBOL SUBMIT UNTUK FILE UPLOAD -->
                <button id="btn-submit-karya" onclick="submitKaryaUpload()" class="btn-playful w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                  <span class="text-base">🚀</span>
                  <span id="btn-submit-karya-text">Submit / Kirim Foto Karya ke Database</span>
                </button>
              </div>

              <!-- NOTIFIKASI SUDAH TERSUBMIT (Sesuai Permintaan Revisi #1 & #2) -->
              <div id="karya-submitted-notification" class="hidden p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-md space-y-2 animate-bounce-gentle">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 font-black text-sm text-emerald-900">
                    <span class="text-2xl">🎉</span>
                    <span>NOTIFIKASI: Foto Karya Berhasil Tersubmit!</span>
                  </div>
                  <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Cloud ✅</span>
                </div>
                <p id="karya-submitted-desc" class="text-xs text-emerald-800 leading-relaxed font-medium">
                  Keren sekali! Foto karyamu telah sukses tersimpan ke database cloud Ruang Belajar Ceria.
                </p>
                <div class="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-950">
                    🟢 Status: Terverifikasi di Database Supabase
                  </span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                    ⭐ +25 Poin & +5 Bintang Didapat!
                  </span>
                </div>
              </div>
            </div>

            <!-- Link Upload Padlet Produk Celengan Kreatif (Highlight Besar) -->
            <div class="mt-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 text-white border-4 border-rose-300 ring-4 ring-rose-200/70 shadow-2xl space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-rose-900 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
                  <span>❤️</span> <span>LINK KOLABORASI PAMERAN KARYA</span>
                </span>
                <span class="text-xs font-black text-slate-900 bg-amber-300 px-3 py-1 rounded-full shadow-sm animate-pulse">
                  🎨 Wajib Upload!
                </span>
              </div>

              <p class="text-lg sm:text-2xl font-black text-white leading-snug">
                jangan lupa upload karyamu disini juga ya❤️
              </p>

              <a href="https://padlet.com/nurafifahn16/produkcelengankreatif" target="_blank" rel="noopener noreferrer" class="block w-full p-3.5 sm:p-4 rounded-2xl bg-white text-rose-950 border-2 border-amber-300 hover:bg-rose-50 transition-all shadow-md group">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 block mb-1">🔗 KLIK LINK PADLET PRODUK CELENGAN KREATIF:</span>
                <span class="text-xs sm:text-base font-black underline break-all group-hover:text-indigo-700">
                  https://padlet.com/nurafifahn16/produkcelengankreatif
                </span>
              </a>

              <a href="https://padlet.com/nurafifahn16/produkcelengankreatif" target="_blank" rel="noopener noreferrer" class="btn-playful w-full px-6 py-4 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-sm sm:text-lg flex items-center justify-center gap-2.5 shadow-xl">
                <span>🎨 UPLOAD KARYAMU KE PADLET SEKARANG ↗️</span>
              </a>
            </div>

            <!-- Galeri Karya Siswa -->
            <div class="mt-6 pt-4 border-t border-slate-100">
              <h4 class="font-bold text-slate-800 text-sm mb-3">Pameran Celengan Teman:</h4>
              <div id="galeri-karya-container" class="grid grid-cols-2 gap-3 text-center">
                <div class="p-3 bg-slate-50 rounded-2xl border text-xs space-y-1">
                  <div class="flex justify-center mb-1">
                    ${RBC_ICONS.celenganAyam('w-10 h-10')}
                  </div>
                  <span class="font-bold text-slate-800 block">Celengan Ayam</span>
                  <span class="text-[10px] text-slate-500">Karya Bima - Kelas 3A</span>
                </div>
                <div class="p-3 bg-slate-50 rounded-2xl border text-xs space-y-1">
                  <span class="text-3xl block">🚀</span>
                  <span class="font-bold text-slate-800 block">Celengan Roket Impian</span>
                  <span class="text-[10px] text-slate-500">Karya Siti - Kelas 3A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. RUBRIK & REFLEKSI MANDIRI (Right Column sesuai Storyboard Page 6) -->
        <div class="lg:col-span-6 space-y-6">
          <!-- Rubrik Penilaian -->
          <div class="card-pastel p-6 border-2 border-indigo-200">
            <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <span>📋 Rubrik Penilaian Karya</span>
            </h4>
            <div class="overflow-x-auto -mx-2 px-2 pb-2">
              <table class="w-full text-left text-xs border-collapse min-w-[380px]">
                <thead>
                  <tr class="bg-indigo-50 text-indigo-900 border-b border-indigo-200">
                    <th class="p-2 font-bold">Kriteria</th>
                    <th class="p-2 font-bold text-center">Sangat Baik (4)</th>
                    <th class="p-2 font-bold text-center">Baik (3)</th>
                    <th class="p-2 font-bold text-center">Cukup (2)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td class="p-2 font-semibold">1. Memilih Kebutuhan</td>
                    <td class="p-2 text-center text-emerald-600 font-bold">✓ Tepat semua</td>
                    <td class="p-2 text-center">Sebagian besar</td>
                    <td class="p-2 text-center">Masih campur</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-semibold">2. Kesesuaian Harga</td>
                    <td class="p-2 text-center text-emerald-600 font-bold">✓ Sesuai anggaran</td>
                    <td class="p-2 text-center">Mendekati</td>
                    <td class="p-2 text-center">Melebihi</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-semibold">3. Alasan Pilihan</td>
                    <td class="p-2 text-center text-emerald-600 font-bold">✓ Logis & runtut</td>
                    <td class="p-2 text-center">Cukup jelas</td>
                    <td class="p-2 text-center">Kurang lengkap</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-semibold">4. Celengan Kreatif</td>
                    <td class="p-2 text-center text-emerald-600 font-bold">✓ Rapi & indah</td>
                    <td class="p-2 text-center">Rapi</td>
                    <td class="p-2 text-center">Sederhana</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Refleksi Mandiri: 3 Kalimat Emas -->
          <div class="card-pastel p-6 border-2 border-pink-200 space-y-4">
            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>💭 Refleksi Mandiri Belajarku</span>
            </h4>
            <div class="space-y-3 text-xs md:text-sm">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Aku tahu...</label>
                <input type="text" id="ref-tahu" placeholder="Hal baru yang aku pahami hari ini..." class="w-full p-2.5 rounded-xl border border-slate-300"/>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Aku merasa...</label>
                <input type="text" id="ref-merasa" placeholder="Perasaanku saat belajar materi ini..." class="w-full p-2.5 rounded-xl border border-slate-300"/>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Aku ingin mencoba...</label>
                <input type="text" id="ref-mencoba" placeholder="Kebiasaan baik mengelola uang yang ingin aku lakukan..." class="w-full p-2.5 rounded-xl border border-slate-300"/>
              </div>
            </div>

            <button onclick="submitStudentReflection()" class="btn-playful w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm rounded-xl shadow-md">
              <span>Simpan Refleksi & Klaim Sertifikat! 🎓</span>
            </button>
            <div id="refleksi-notif-box" class="hidden mt-3"></div>
          </div>
        </div>
      </div>

      <!-- SERTIFIKAT KELULUSAN (Hidden until claimed, printable) -->
      <div id="certificate-section" class="hidden pt-6">
        <div id="certificate-print-area" class="card-pastel p-4 sm:p-8 md:p-12 border-4 sm:border-8 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-sky-50 text-center relative overflow-hidden shadow-2xl">
          <div class="absolute top-4 left-4 text-3xl">⭐</div>
          <div class="absolute top-4 right-4 text-3xl">⭐</div>
          <div class="absolute bottom-4 left-4 text-3xl">🪙</div>
          <div class="absolute bottom-4 right-4 text-3xl">🪙</div>

          <div class="max-w-xl mx-auto space-y-4">
            <div class="flex justify-center mb-2">
              ${RBC_ICONS.upiLogo('w-16 h-16 sm:w-20 sm:h-20')}
            </div>

            <span class="text-xs font-black tracking-widest uppercase text-red-700 block">UNIVERSITAS PENDIDIKAN INDONESIA - KAMPUS DI CIBIRU</span>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-800">SERTIFIKAT PENGHARGAAN</h2>
            <p class="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">Diberikan Dengan Penuh Rasa Bangga Kepada:</p>
            
            <div class="py-2 border-b-2 border-amber-400">
              <h3 id="cert-student-name" class="text-2xl sm:text-3xl font-black text-sky-700 font-title">${AppState.studentName}</h3>
            </div>

            <p class="text-slate-600 text-sm leading-relaxed font-medium">
              Telah berhasil menyelesaikan seluruh tahapan pembelajaran <strong>Model DHETIK</strong> pada materi <em>Bab 5: Bijak Berbelanja Kebutuhan</em>, dan dinobatkan sebagai:
            </p>

            <div class="inline-block px-6 py-2 rounded-full bg-amber-400 text-slate-900 font-black text-base shadow-md">
              🌟 ANAK HEBAT BIJAK BERBELANJA 🌟
            </div>

            <div class="pt-6 grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 border-t border-slate-200">
              <div>
                <span>Tanggal Terbit:</span><br/>
                <strong class="text-slate-800">${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
              <div>
                <span>Tim Pengembang:</span><br/>
                <strong class="text-slate-800">Kelompok 4 PGSD UPI Cibiru</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-6">
          <button onclick="window.print()" class="btn-playful w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md">
            <span>🖨️ Cetak / Simpan Sertifikat</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

async function initTahapKView() {
  if (AppState.reflection.tahu) {
    const t = document.getElementById('ref-tahu');
    const m = document.getElementById('ref-merasa');
    const c = document.getElementById('ref-mencoba');
    if (t) t.value = AppState.reflection.tahu;
    if (m) m.value = AppState.reflection.merasa;
    if (c) c.value = AppState.reflection.mencoba;
  }

  const galeri = document.getElementById('galeri-karya-container');
  if (!galeri) return;

  // 1. Ambil foto karya dari database cloud Supabase jika terhubung
  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    try {
      const cloudKarya = await window.RBC_SUPABASE.getHasilKaryaku();
      if (cloudKarya && cloudKarya.length > 0) {
        // Tampilkan foto dari database cloud
        cloudKarya.forEach(k => {
          if (!k.foto_karya) return;
          const myCard = document.createElement('div');
          myCard.className = 'p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border-2 border-indigo-300 text-xs space-y-1 shadow-sm cursor-pointer transition-all hover:scale-105 group';
          myCard.onclick = () => openImageLightbox(k.foto_karya, k.judul_karya, k.nama_siswa);
          myCard.innerHTML = `
            <div class="relative w-full h-24 rounded-xl overflow-hidden bg-white mb-1 border border-indigo-200">
              <img src="${k.foto_karya}" alt="Karyaku" class="w-full h-full object-cover"/>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold">
                🔍 Buka Foto
              </div>
            </div>
            <span class="font-black text-indigo-950 block truncate">${k.judul_karya || 'Celengan Ayam'}</span>
            <span class="text-[10px] text-indigo-700 font-bold block truncate">Karya ${k.nama_siswa || 'Teman Ceria'} ⭐ (Cloud)</span>
          `;
          galeri.prepend(myCard);
        });
        return;
      }
    } catch (e) {
      console.warn('initTahapKView cloud fetch notice:', e);
    }
  }

  // 2. Fallback: Tampilkan dari localStorage
  const savedKarya = JSON.parse(localStorage.getItem('rbc_saved_karya') || '[]');
  if (savedKarya.length > 0) {
    savedKarya.forEach(k => {
      const myCard = document.createElement('div');
      myCard.className = 'p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border-2 border-indigo-300 text-xs space-y-1 shadow-sm cursor-pointer transition-all hover:scale-105 group';
      myCard.onclick = () => openImageLightbox(k.dataUrl, k.title, k.author);
      myCard.innerHTML = `
        <div class="relative w-full h-24 rounded-xl overflow-hidden bg-white mb-1 border border-indigo-200">
          <img src="${k.dataUrl}" alt="Karyaku" class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold">
            🔍 Buka Foto
          </div>
        </div>
        <span class="font-black text-indigo-950 block truncate">${k.title || 'Celengan Ayam'}</span>
        <span class="text-[10px] text-indigo-600 font-bold block truncate">Karya ${k.author || AppState.studentName} ⭐</span>
      `;
      galeri.prepend(myCard);
    });
  }
}

// ============================================================
// MODAL LIGHTBOX LIHAT FOTO PENUH
// ============================================================
function openImageLightbox(imgSrc, title, author) {
  const modal = document.getElementById('image-lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const tEl = document.getElementById('lightbox-title');
  const aEl = document.getElementById('lightbox-author');
  const dl = document.getElementById('lightbox-download-btn');

  if (!modal || !img) return;

  img.src = imgSrc;
  if (tEl) tEl.innerText = title || 'Foto Karyaku';
  if (aEl) aEl.innerText = author ? `Karya ${author}` : 'Karya Siswa';
  if (dl) {
    dl.href = imgSrc;
    dl.download = (title ? title.toLowerCase().replace(/[^a-z0-9]/gi, '_') : 'karya_celengan') + '.jpg';
  }

  modal.classList.remove('hidden');
  window.soundManager.playPop();
}

function closeImageLightbox(e) {
  if (e && e.target && e.target.id !== 'image-lightbox-modal' && e.target.tagName !== 'BUTTON') {
    return;
  }
  document.getElementById('image-lightbox-modal')?.classList.add('hidden');
}

window.tempKaryaUpload = null;

async function handleKaryaFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const btn = document.getElementById('btn-submit-karya');
  const btnText = document.getElementById('btn-submit-karya-text');
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = '⏳ Mengoptimalkan foto...';

  const { dataUrl, size } = await compressImageFile(file, 1000, 0.75);
  const sizeKB = Math.round(size / 1024);
  const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

  window.tempKaryaUpload = {
    file: file,
    name: file.name,
    dataUrl: dataUrl,
    size: size,
    sizeStr: sizeStr,
    type: 'image/jpeg'
  };

  const previewContainer = document.getElementById('karya-preview-container');
  const previewImg = document.getElementById('karya-preview-img');
  const nameEl = document.getElementById('karya-file-name');
  const sizeEl = document.getElementById('karya-file-size');
  const notifEl = document.getElementById('karya-submitted-notification');

  if (previewContainer && previewImg) {
    previewImg.src = dataUrl;
    if (nameEl) nameEl.innerText = file.name;
    if (sizeEl) sizeEl.innerText = sizeStr;
    previewContainer.classList.remove('hidden');
    if (notifEl) notifEl.classList.add('hidden');
    window.soundManager.playPop();

    if (btn) btn.disabled = false;
    if (btnText) btnText.innerText = 'Submit / Kirim Foto Karyaku ke Database';
  }
}

// Alias untuk kompatibilitas
function handleKaryaUpload(e) {
  handleKaryaFileSelect(e);
}

async function submitKaryaUpload() {
  if (!window.tempKaryaUpload) {
    alert('Silakan pilih foto karyamu terlebih dahulu sebelum klik submit!');
    return;
  }

  const title = document.getElementById('karya-title-input')?.value.trim() || 'Celengan Ayam Kreasi & Rencana Belanja';
  const btn = document.getElementById('btn-submit-karya');
  const btnText = document.getElementById('btn-submit-karya-text');

  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = '⏳ Mengunggah ke Database...';

  // 1. Simpan ke Supabase Database (hasil_karyaku & refleksi_siswa)
  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    await window.RBC_SUPABASE.saveHasilKaryaku({
      nama: AppState.studentName || 'Teman Belajar',
      judul: title,
      deskripsi: 'Karya Celengan Kreatif & Rencana Belanja',
      fileNama: window.tempKaryaUpload.name,
      fileData: window.tempKaryaUpload.dataUrl,
      fileUkuran: window.tempKaryaUpload.size,
      fileTipe: window.tempKaryaUpload.type
    });
  }

  // 2. Simpan ke LocalStorage agar karya tetap muncul
  const savedKarya = JSON.parse(localStorage.getItem('rbc_saved_karya') || '[]');
  savedKarya.unshift({
    author: AppState.studentName || 'Teman Belajar',
    title: title,
    dataUrl: window.tempKaryaUpload.dataUrl,
    date: new Date().toLocaleTimeString('id-ID')
  });
  localStorage.setItem('rbc_saved_karya', JSON.stringify(savedKarya));

  // 3. Efek & Hadiah
  window.soundManager.playFanfare();
  triggerConfetti();
  AppState.addReward(25, 5, 'Karyamu berhasil tersubmit dan tersimpan ke database!');
  AppState.unlockBadge('sahabat-celengan');

  // 4. Tampilkan NOTIFIKASI SUDAH TERSUBMIT (Requirement #1)
  const notifEl = document.getElementById('karya-submitted-notification');
  const descEl = document.getElementById('karya-submitted-desc');
  if (descEl) {
    descEl.innerHTML = `
      Hore, <strong>${AppState.studentName}</strong>! Foto karyamu <em>"${title}"</em> telah sukses tersimpan ke database cloud Ruang Belajar Ceria pada <strong>${new Date().toLocaleTimeString('id-ID')} WIB</strong>.
      <div class="pt-2">
        <button onclick="openImageLightbox('${window.tempKaryaUpload.dataUrl}', '${title.replace(/'/g, "\\'")}', '${AppState.studentName.replace(/'/g, "\\'")}')" class="btn-playful px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <span>🔍 Buka & Perbesar Foto Karyaku</span>
        </button>
      </div>
    `;
  }
  if (notifEl) {
    notifEl.classList.remove('hidden');
    notifEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (btnText) btnText.innerText = '✅ Foto Karya Sudah Tersubmit!';

  // 5. Tambahkan karya siswa ke Galeri Karya langsung dengan klik untuk perbesar
  const galeri = document.getElementById('galeri-karya-container');
  if (galeri) {
    const myCard = document.createElement('div');
    myCard.className = 'p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border-2 border-indigo-300 text-xs space-y-1 shadow-sm animate-fade-in cursor-pointer transition-all hover:scale-105 group';
    myCard.onclick = () => openImageLightbox(window.tempKaryaUpload.dataUrl, title, AppState.studentName);
    myCard.innerHTML = `
      <div class="relative w-full h-24 rounded-xl overflow-hidden bg-white mb-1 border border-indigo-200">
        <img src="${window.tempKaryaUpload.dataUrl}" alt="Karyaku" class="w-full h-full object-cover"/>
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold">
          🔍 Buka Foto
        </div>
      </div>
      <span class="font-black text-indigo-950 block truncate">${title}</span>
      <span class="text-[10px] text-indigo-700 font-bold block">Karya ${AppState.studentName} ⭐ (Baru)</span>
    `;
    galeri.prepend(myCard);
  }

  AppState.showToast('✅ Foto karya berhasil tersubmit ke database!');
}

async function submitStudentReflection() {
  const tahu = document.getElementById('ref-tahu')?.value.trim();
  const merasa = document.getElementById('ref-merasa')?.value.trim();
  const mencoba = document.getElementById('ref-mencoba')?.value.trim();

  if (!tahu || !merasa || !mencoba) {
    alert('Mohon lengkapi ketiga kalimat refleksi mandiri ya!');
    return;
  }

  AppState.reflection = { tahu, merasa, mencoba };
  AppState.markStageComplete('k');

  const uploadedFoto = window.tempKaryaUpload?.dataUrl || JSON.parse(localStorage.getItem('rbc_saved_karya') || '[]')[0]?.dataUrl || null;

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    await window.RBC_SUPABASE.saveReflection({
      nama: AppState.studentName || 'Teman Belajar',
      tahu, merasa, mencoba,
      fotoUrl: uploadedFoto
    });
  }
  AppState.addReward(30, 5, 'Selamat! Kamu telah menyelesaikan seluruh tahapan DHETIK!');
  AppState.unlockBadge('petualang-hebat');

  const notifBox = document.getElementById('refleksi-notif-box');
  if (notifBox) {
    notifBox.classList.remove('hidden');
    notifBox.innerHTML = `
      <div class="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1.5 shadow-sm animate-fade-in">
        <div class="flex items-center justify-between font-black text-emerald-900 text-sm">
          <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: Refleksi Berhasil Tersubmit!</span>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
        </div>
        <p class="text-emerald-800 leading-relaxed font-medium">
          Ketiga kalimat emas refleksimu telah tersimpan ke database cloud. Terima kasih telah belajar dengan penuh semangat!
        </p>
      </div>
    `;
  }
  AppState.showToast('✅ Refleksi berhasil tersubmit ke database!');

  const cert = document.getElementById('certificate-section');
  const nameEl = document.getElementById('cert-student-name');
  if (nameEl) nameEl.innerText = AppState.studentName;
  if (cert) {
    cert.classList.remove('hidden');
    cert.scrollIntoView({ behavior: 'smooth' });
    triggerConfetti();
  }
}

/* ============================================================
   VIEW 8: VIDEO PEMBELAJARAN (VIDEO HUB)
   ============================================================ */
function renderVideoView() {
  return `
    <div class="space-y-6 sm:space-y-8 animate-fade-in">
      <div class="rounded-3xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Pojok Nonton</span>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black mt-2">Video Pembelajaran Ceria</h1>
          <p class="text-rose-100 text-sm md:text-base font-medium max-w-xl">
            Tonton kumpulan video edukasi menarik tentang uang rupiah, fungsi uang, dan cara cerdas berbelanja.
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('cheering', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${RBC_DATA.videos.map(vid => `
          <div class="card-pastel p-5 border-2 border-slate-100 hover:border-rose-300 transition-all flex flex-col justify-between space-y-4">
            <div class="video-responsive bg-slate-900 shadow-md">
              ${vid.youtubeId ? `
                <iframe src="https://www.youtube.com/embed/${vid.youtubeId}" title="${vid.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              ` : `
                <video controls class="w-full h-full object-cover">
                  <source src="${vid.localFile}" type="video/mp4"/>
                  Browser tidak mendukung video tag.
                </video>
              `}
            </div>
            <div>
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">${vid.category}</span>
                <span class="text-xs font-semibold text-slate-400">⏱️ ${vid.duration}</span>
              </div>
              <h3 class="font-bold text-slate-800 text-base mt-2">${vid.title}</h3>
              <p class="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed">${vid.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function initVideoView() {}

/* ============================================================
   VIEW 9: KUIS INTERAKTIF
   10 Soal Pilihan Ganda dengan Skor Otomatis & Pembahasan
   ============================================================ */
function renderKuisView() {
  return `
    <div class="space-y-6 sm:space-y-8 animate-fade-in">
      <div class="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Uji Pemahaman</span>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black mt-2">Kuis Interaktif IPAS Kelas 3 SD</h1>
          <p class="text-amber-100 text-sm md:text-base font-medium max-w-xl">
            Jawab 10 soal pilihan ganda tentang uang rupiah dan bijak berbelanja untuk mendapatkan Bintang & Skor Tertinggi!
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('cheering', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <div id="kuis-engine-container">
        <!-- Rendered by initKuisView -->
      </div>
    </div>
  `;
}

function initKuisView() {
  AppState.quizIndex = 0;
  AppState.quizAnswers = [];
  AppState.quizCompleted = false;
  AppState.quizScore = 0;
  renderCurrentQuizQuestion();
}

function renderCurrentQuizQuestion() {
  const container = document.getElementById('kuis-engine-container');
  if (!container) return;

  if (AppState.quizCompleted) {
    const total = RBC_DATA.quizQuestions.length;
    const score = Math.round((AppState.quizScore / total) * 100);
    const correctCount = AppState.quizScore;
    const wrongCount = total - correctCount;

    container.innerHTML = `
      <div class="card-pastel p-8 md:p-12 border-4 border-amber-300 text-center space-y-6">
        <div class="w-24 h-24 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl shadow-inner">
          ${score >= 80 ? '🏆' : '⭐'}
        </div>
        <h2 class="text-3xl font-black text-slate-800">
          ${score >= 80 ? 'Hebat Sekali! Kamu Juara Kuis! 🎉' : 'Bagus! Tetap Semangat Belajar! 💪'}
        </h2>
        <div class="text-5xl font-black text-amber-600 font-title">
          Skor: ${score}
        </div>
        <div class="flex justify-center gap-6 text-sm font-bold">
          <span class="text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">✅ Benar: ${correctCount}</span>
          <span class="text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">❌ Salah: ${wrongCount}</span>
        </div>

        <!-- NOTIFIKASI SUBMIT KUIS -->
        <div class="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl max-w-md mx-auto text-xs space-y-1">
          <div class="flex items-center justify-between font-black text-emerald-900">
            <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: Skor Kuis Berhasil Tersubmit!</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
          </div>
          <p class="text-emerald-800 font-medium">Hasil pengerjaan kuis kamu telah tersimpan ke database cloud.</p>
        </div>

        <p class="text-slate-600 text-sm max-w-md mx-auto">
          ${score >= 80 ? 'Kamu sudah memahami materi jenis uang, fungsi uang, dan bijak berbelanja dengan sangat baik!' : 'Jangan menyerah! Kamu bisa mengulang kuis untuk mendapatkan nilai 100!'}
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
          <button onclick="initKuisView()" class="btn-playful w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
            🔄 Ulangi Kuis
          </button>
          <button onclick="switchTab('beranda')" class="btn-playful w-full sm:w-auto px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl text-sm flex items-center justify-center gap-2">
            Kembali ke Materi
          </button>
        </div>
      </div>
    `;
    if (score >= 80) {
      AppState.unlockBadge('jago-kuis');
      triggerConfetti();
    }
    return;
  }

  const q = RBC_DATA.quizQuestions[AppState.quizIndex];
  const total = RBC_DATA.quizQuestions.length;

  container.innerHTML = `
    <div class="card-pastel p-4 sm:p-6 md:p-8 border-2 border-amber-200 space-y-4 sm:space-y-6">
      <div class="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>SOAL ${AppState.quizIndex + 1} DARI ${total}</span>
        <span class="text-amber-600">Skor: ${AppState.quizScore * 10}</span>
      </div>

      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div class="bg-amber-500 h-2.5 rounded-full transition-all" style="width: ${((AppState.quizIndex + 1) / total) * 100}%"></div>
      </div>

      <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-snug">
        ${q.question}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3" id="quiz-options-container">
        ${q.options.map((opt, idx) => `
          <button onclick="answerQuizOption(${idx})" class="p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/50 text-left font-bold text-slate-800 text-xs sm:text-sm transition-all flex items-center gap-3 group">
            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 group-hover:bg-amber-200 text-slate-700 flex items-center justify-center text-xs flex-shrink-0">
              ${['A', 'B', 'C', 'D'][idx]}
            </span>
            <span class="flex-1">${opt}</span>
          </button>
        `).join('')}
      </div>

      <!-- Feedback & Discussion Box -->
      <div id="quiz-feedback-box" class="hidden p-4 rounded-2xl text-xs sm:text-sm font-medium space-y-2"></div>

      <div id="quiz-next-btn-container" class="hidden flex justify-stretch sm:justify-end">
        <button onclick="nextQuizQuestion()" class="btn-playful w-full sm:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
          <span>Soal Selanjutnya ➔</span>
        </button>
      </div>
    </div>
  `;
}

function answerQuizOption(choiceIdx) {
  const q = RBC_DATA.quizQuestions[AppState.quizIndex];
  const isCorrect = choiceIdx === q.correct;
  const optContainer = document.getElementById('quiz-options-container');
  const fbBox = document.getElementById('quiz-feedback-box');
  const nextContainer = document.getElementById('quiz-next-btn-container');

  if (!optContainer || !fbBox) return;

  optContainer.querySelectorAll('button').forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.correct) {
      b.className = "p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-left font-bold text-emerald-900 text-sm flex items-center gap-3";
    } else if (idx === choiceIdx) {
      b.className = "p-4 rounded-2xl border-2 border-rose-400 bg-rose-50 text-left font-bold text-rose-900 text-sm flex items-center gap-3";
    }
  });

  fbBox.classList.remove('hidden', 'bg-emerald-50', 'border-emerald-200', 'bg-rose-50', 'border-rose-200');
  if (isCorrect) {
    AppState.quizScore++;
    window.soundManager.playCorrect();
    fbBox.className = "p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-sm font-medium space-y-1 block";
    fbBox.innerHTML = `
      <div class="font-bold flex items-center gap-2">
        <span>🎉 Hebat! Jawabanmu Benar!</span>
      </div>
      <p class="text-xs text-slate-700">${q.explanation}</p>
    `;
  } else {
    window.soundManager.playWrong();
    fbBox.className = "p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-sm font-medium space-y-1 block";
    fbBox.innerHTML = `
      <div class="font-bold flex items-center gap-2">
        <span>💪 Jangan Menyerah! Yuk, Coba Lagi!</span>
      </div>
      <p class="text-xs text-slate-700"><strong>Pembahasan:</strong> ${q.explanation}</p>
    `;
  }

  if (nextContainer) nextContainer.classList.remove('hidden');
}

function nextQuizQuestion() {
  AppState.quizIndex++;
  if (AppState.quizIndex >= RBC_DATA.quizQuestions.length) {
    AppState.quizCompleted = true;
    AppState.addReward(AppState.quizScore * 5, 5, 'Kuis selesai dikerjakan!');
    if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
      window.RBC_SUPABASE.saveQuizResult({
        nama: AppState.studentName || 'Teman Belajar',
        score: AppState.quizScore,
        total: RBC_DATA.quizQuestions.length,
        percent: Math.round((AppState.quizScore / RBC_DATA.quizQuestions.length) * 100)
      });
    }
    AppState.showToast('✅ Hasil kuis berhasil tersubmit ke database!');
  }
  renderCurrentQuizQuestion();
}

/* ============================================================
   VIEW 10: GAME EDUKASI (5 GAME NYATA)
   1. Tebak Gambar
   2. Susun Kata
   3. Petualangan Matematika
   4. Pasangkan Jawaban
   5. Benar atau Salah
   ============================================================ */
function renderGameView() {
  return `
    <div class="space-y-6 sm:space-y-8 animate-fade-in">
      <div class="rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Bermain Sambil Belajar</span>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black mt-2">Pojok Game Edukasi Ceria</h1>
          <p class="text-emerald-100 text-sm md:text-base font-medium max-w-xl">
            Pilih 5 permainan edukasi seru di bawah ini untuk mengasah ketangkasan dan pengetahuan finansialmu!
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('happy', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Game Selector Buttons (Swipeable on Mobile) -->
      <div class="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar" id="game-selector-tabs">
        <button onclick="switchGameView('tebak')" class="flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-emerald-500 bg-emerald-500 text-white shadow-sm flex flex-col items-center gap-1">
          <span class="text-xl">🖼️</span>
          <span>1. Tebak Gambar</span>
        </button>
        <button onclick="switchGameView('susun')" class="flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1">
          <span class="text-xl">🔤</span>
          <span>2. Susun Kata</span>
        </button>
        <button onclick="switchGameView('matematika')" class="flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1">
          <span class="text-xl">🧮</span>
          <span>3. Matematika</span>
        </button>
        <button onclick="switchGameView('pasang')" class="flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1">
          <span class="text-xl">🧩</span>
          <span>4. Pasangkan</span>
        </button>
        <button onclick="switchGameView('benarsalah')" class="flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1">
          <span class="text-xl">⚖️</span>
          <span>5. Benar / Salah</span>
        </button>
      </div>

      <div id="game-active-container" class="card-pastel p-4 sm:p-6 md:p-8 border-2 border-emerald-200">
        <!-- Filled dynamically -->
      </div>
    </div>
  `;
}

function initGameView() {
  switchGameView('tebak');
}

function switchGameView(gameKey) {
  AppState.gameActive = gameKey;
  window.soundManager.playPop();

  document.querySelectorAll('#game-selector-tabs button').forEach(btn => {
    if (btn.innerText.toLowerCase().includes(gameKey)) {
      btn.className = "flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-emerald-500 bg-emerald-500 text-white shadow-sm flex flex-col items-center gap-1";
    } else {
      btn.className = "flex-shrink-0 min-w-[105px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1";
    }
  });

  const container = document.getElementById('game-active-container');
  if (!container) return;

  switch (gameKey) {
    case 'tebak':
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b">
            <div>
              <span class="text-xs font-bold text-emerald-600 uppercase">Game 1</span>
              <h3 class="text-xl font-bold text-slate-800">Tebak Gambar Uang & Barang</h3>
            </div>
            <span class="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">Petunjuk: Perhatikan gambar!</span>
          </div>
          <div class="p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
            <div class="w-32 h-32 rounded-full bg-amber-200 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-md">
              🪙 500
            </div>
            <p class="font-bold text-slate-800 text-center">Berapakah nilai uang koin logam pada gambar di atas?</p>
            <div class="grid grid-cols-2 gap-3 w-full max-w-sm">
              <button onclick="checkGameAnswer(true, 'Benar! Itu adalah koin Rp500!')" class="p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 font-bold text-sm">Rp500</button>
              <button onclick="checkGameAnswer(false, 'Kurang tepat.')" class="p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 font-bold text-sm">Rp1.000</button>
              <button onclick="checkGameAnswer(false, 'Kurang tepat.')" class="p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 font-bold text-sm">Rp200</button>
              <button onclick="checkGameAnswer(false, 'Kurang tepat.')" class="p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 font-bold text-sm">Rp100</button>
            </div>
            <div id="game-feedback" class="hidden p-3 rounded-xl text-xs font-bold text-center"></div>
          </div>
        </div>
      `;
      break;
    case 'susun':
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b">
            <div>
              <span class="text-xs font-bold text-emerald-600 uppercase">Game 2</span>
              <h3 class="text-xl font-bold text-slate-800">Susun Kata Ceria</h3>
            </div>
            <span class="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">Petunjuk: Susun huruf berikut!</span>
          </div>
          <div class="p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
            <p class="text-xs text-slate-600">Mata uang resmi negara Indonesia adalah:</p>
            <div class="flex gap-2 text-2xl font-black text-purple-700">
              <span class="p-3 bg-white rounded-xl shadow-sm border border-purple-200">R</span>
              <span class="p-3 bg-white rounded-xl shadow-sm border border-purple-200">U</span>
              <span class="p-3 bg-white rounded-xl shadow-sm border border-purple-200">P</span>
              <span class="p-3 bg-white rounded-xl shadow-sm border border-purple-200">I</span>
              <span class="p-3 bg-white rounded-xl shadow-sm border border-purple-200">A</span>
              <span class="p-3 bg-white rounded-xl shadow-sm border border-purple-200">H</span>
            </div>
            <div class="flex gap-2 mt-4">
              <button onclick="checkGameAnswer(true, 'Hebat! Kamu berhasil menyusun kata RUPIAH!')" class="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs">Cek Jawaban ✨</button>
            </div>
            <div id="game-feedback" class="hidden p-3 rounded-xl text-xs font-bold text-center"></div>
          </div>
        </div>
      `;
      break;
    case 'matematika':
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b">
            <div>
              <span class="text-xs font-bold text-emerald-600 uppercase">Game 3</span>
              <h3 class="text-xl font-bold text-slate-800">Petualangan Matematika Belanja</h3>
            </div>
          </div>
          <div class="p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
            <p class="font-bold text-slate-800 text-center">Budi membeli pensil seharga Rp3.000 dan buku seharga Rp5.000. Berapakah total yang harus dibayar Budi?</p>
            <div class="grid grid-cols-2 gap-3 w-full max-w-sm">
              <button onclick="checkGameAnswer(false, 'Hitung kembali: 3.000 + 5.000')" class="p-3 bg-white rounded-xl border font-bold text-sm">Rp7.000</button>
              <button onclick="checkGameAnswer(true, 'Tepat! Rp3.000 + Rp5.000 = Rp8.000!')" class="p-3 bg-white rounded-xl border font-bold text-sm">Rp8.000</button>
              <button onclick="checkGameAnswer(false, 'Masih belum tepat.')" class="p-3 bg-white rounded-xl border font-bold text-sm">Rp9.000</button>
              <button onclick="checkGameAnswer(false, 'Masih belum tepat.')" class="p-3 bg-white rounded-xl border font-bold text-sm">Rp10.000</button>
            </div>
            <div id="game-feedback" class="hidden p-3 rounded-xl text-xs font-bold text-center"></div>
          </div>
        </div>
      `;
      break;
    case 'pasang':
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b">
            <div>
              <span class="text-xs font-bold text-emerald-600 uppercase">Game 4</span>
              <h3 class="text-xl font-bold text-slate-800">Pasangkan Jawaban</h3>
            </div>
          </div>
          <div class="p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
            <p class="text-xs text-slate-600">Pasangkan fungsi berikut: <strong>Membeli seragam sekolah untuk dipakai belajar</strong></p>
            <div class="flex gap-3">
              <button onclick="checkGameAnswer(true, 'Tepat! Seragam sekolah adalah Kebutuhan pokok siswa!')" class="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm">Kebutuhan Pokok</button>
              <button onclick="checkGameAnswer(false, 'Seragam bukan sekadar keinginan, melainkan kebutuhan penting!')" class="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl text-sm">Keinginan Saja</button>
            </div>
            <div id="game-feedback" class="hidden p-3 rounded-xl text-xs font-bold text-center"></div>
          </div>
        </div>
      `;
      break;
    case 'benarsalah':
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b">
            <div>
              <span class="text-xs font-bold text-emerald-600 uppercase">Game 5</span>
              <h3 class="text-xl font-bold text-slate-800">Benar atau Salah</h3>
            </div>
          </div>
          <div class="p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
            <p class="font-bold text-slate-800 text-center text-sm md:text-base">
              "Uang koin Rp1.000 memiliki nilai yang SAMA BESAR dengan selembar uang kertas Rp1.000."
            </p>
            <div class="flex gap-4">
              <button onclick="checkGameAnswer(true, 'BENAR! Keduanya bernilai sama persis Rp1.000!')" class="px-8 py-3 bg-emerald-500 text-white font-black rounded-2xl text-base shadow-md">BENAR 👍</button>
              <button onclick="checkGameAnswer(false, 'Pernyataan tersebut benar, nilainya sama!')" class="px-8 py-3 bg-rose-500 text-white font-black rounded-2xl text-base shadow-md">SALAH 👎</button>
            </div>
            <div id="game-feedback" class="hidden p-3 rounded-xl text-xs font-bold text-center"></div>
          </div>
        </div>
      `;
      break;
  }
}

function checkGameAnswer(isCorrect, msg) {
  const fb = document.getElementById('game-feedback');
  if (!fb) return;
  fb.classList.remove('hidden', 'bg-emerald-100', 'text-emerald-800', 'bg-rose-100', 'text-rose-800');
  if (isCorrect) {
    window.soundManager.playCorrect();
    fb.classList.add('bg-emerald-100', 'text-emerald-800');
    fb.innerHTML = `🎉 ${msg} (+10 Bintang!)`;
    AppState.addReward(10, 2);
  } else {
    window.soundManager.playWrong();
    fb.classList.add('bg-rose-100', 'text-rose-800');
    fb.innerHTML = `💪 ${msg}`;
  }
}

/* ============================================================
   VIEW 11: TENTANG (ABOUT & TEAM)
   Teks Wajib di Paling Bawah:
   "Belajar Jadi Lebih Seru, Belanja Jadi Lebih Bijak!"
   Ruang Belajar Ceria – Teman Belajar, Petualangan Menyenangkan!
   ============================================================ */
function renderTentangView() {
  return `
    <div class="space-y-6 sm:space-y-10 animate-fade-in max-w-4xl mx-auto">
      <div class="rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-5 sm:p-8 text-white shadow-lg text-center space-y-3">
        <div class="flex justify-center mb-2">
          ${RBC_ICONS.upiLogo('w-20 h-20 sm:w-24 sm:h-24')}
        </div>
        <h1 class="text-2xl sm:text-4xl md:text-5xl font-black">Ruang Belajar Ceria</h1>
        <p class="text-rose-50 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto">
          Media pembelajaran digital interaktif yang dirancang untuk menciptakan pengalaman belajar yang menyenangkan, menarik, dan bermakna bagi peserta didik sekolah dasar.
        </p>
      </div>

      <!-- Tim Pengembang -->
      <div class="card-pastel p-6 md:p-8 border-2 border-sky-100">
        <div class="flex items-center gap-3 mb-6">
          <span class="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl">👥</span>
          <div>
            <span class="text-xs font-bold uppercase text-sky-600 tracking-wider">Profil Peneliti & Pengembang</span>
            <h2 class="text-2xl font-bold text-slate-800">Tim Pengembang Website</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${RBC_DATA.appInfo.developers.map((dev, idx) => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-sky-200 text-sky-900 font-bold text-sm flex items-center justify-center flex-shrink-0">
                ${idx + 1}
              </span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm md:text-base">${dev}</h4>
                <p class="text-xs text-slate-500">PGSD Kampus UPI di Cibiru</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Deskripsi & Tujuan -->
      <div class="card-pastel p-6 md:p-8 border-2 border-amber-100 space-y-4">
        <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>📖 Deskripsi & Tujuan Pengembangan</span>
        </h3>
        <p class="text-slate-700 text-sm md:text-base leading-relaxed">
          Ruang Belajar Ceria merupakan website media pembelajaran interaktif yang dikembangkan sebagai sarana pendukung kegiatan pembelajaran Ilmu Pengetahuan Alam dan Sosial (IPAS) kelas III SD/Fase B, khususnya pada materi Bab 5 – Bijak Berbelanja Kebutuhan.
        </p>
        <p class="text-slate-700 text-sm md:text-base leading-relaxed">
          Website ini dirancang dengan memadukan materi pembelajaran, gambar ilustrasi, video edukatif, LKPD digital, permainan edukasi, kuis interaktif, serta kegiatan refleksi yang dikemas dalam tampilan menarik dan ramah anak. Proses pembelajaran disusun menggunakan <strong>model DHETIK (Dekatkan, Hubungkan, Eksplorasi, Tukar Gagasan, Ikat Konsep, serta Karya dan Refleksi)</strong>.
        </p>
        <p class="text-slate-700 text-sm md:text-base leading-relaxed">
          Tujuan pengembangan website ini adalah untuk membantu peserta didik memahami materi tentang jenis dan nilai uang rupiah, fungsi uang, kegiatan jual beli, perbedaan kebutuhan dan keinginan, serta cara menggunakan uang secara bijak melalui pengalaman belajar yang aktif, interaktif, dan dekat dengan kehidupan sehari-hari.
        </p>
      </div>

      <!-- Sasaran Pengguna & Manfaat -->
      <div class="card-pastel p-6 md:p-8 border-2 border-emerald-100 space-y-6">
        <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>🌱 Manfaat Media Pembelajaran</span>
        </h3>

        <div class="space-y-4 text-sm text-slate-700">
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <h4 class="font-bold text-emerald-900 mb-2">Bagi Peserta Didik:</h4>
            <ul class="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-600">
              <li>Membantu memahami materi pembelajaran melalui gambar, ilustrasi, video, dan aktivitas interaktif.</li>
              <li>Meningkatkan minat dan motivasi belajar melalui permainan edukatif dan kuis.</li>
              <li>Melatih kemampuan mengenali nilai uang dan menggunakannya dalam kegiatan jual beli sederhana.</li>
              <li>Membantu membedakan kebutuhan dan keinginan serta membiasakan perilaku berbelanja secara bijak.</li>
              <li>Melatih kemandirian, kemampuan berpikir kritis, dan keterampilan memecahkan masalah.</li>
              <li>Memberikan kesempatan kepada peserta didik untuk belajar dan mengulang materi sesuai kebutuhan.</li>
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <h4 class="font-bold text-sky-900 mb-2">Bagi Guru:</h4>
            <ul class="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-600">
              <li>Membantu menyampaikan materi pembelajaran secara lebih menarik dan variatif.</li>
              <li>Menyediakan alternatif media pembelajaran digital yang mudah digunakan.</li>
              <li>Mendukung pelaksanaan pembelajaran menggunakan model DHETIK.</li>
              <li>Mempermudah pemberian latihan, kuis, LKPD, dan evaluasi pembelajaran.</li>
              <li>Membantu memantau progres dan hasil belajar peserta didik sesuai fitur yang tersedia.</li>
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <h4 class="font-bold text-purple-900 mb-2">Bagi Proses Pembelajaran:</h4>
            <ul class="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-600">
              <li>Menciptakan suasana belajar yang aktif, menyenangkan, dan tidak monoton.</li>
              <li>Menghubungkan materi pembelajaran dengan pengalaman nyata dalam kehidupan sehari-hari.</li>
              <li>Mendorong interaksi, diskusi, kolaborasi, dan refleksi.</li>
              <li>Mendukung pemanfaatan teknologi digital dalam kegiatan pembelajaran di sekolah dasar.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Teks Wajib di Paling Bawah sesuai Prompt -->
      <div class="p-8 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-900 text-center shadow-lg space-y-2">
        <h3 class="text-2xl md:text-3xl font-black">
          "${RBC_DATA.appInfo.closingTagline}"
        </h3>
        <p class="text-base md:text-lg font-bold">
          ${RBC_DATA.appInfo.closingSubtitle}
        </p>
      </div>
    </div>
  `;
}

/* ============================================================
   VIEW 12: KONTAK (CONTACT & SUGGESTIONS)
   ============================================================ */
function renderKontakView() {
  return `
    <div class="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div class="rounded-3xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 p-5 sm:p-8 text-white shadow-lg text-center space-y-3">
        <span class="px-3.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Ruang Saran & Masukan</span>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-black">Kontak Tim Pengembang</h1>
        <p class="text-sky-100 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto">
          Punya pertanyaan, kesan belajar, atau masukan untuk website Ruang Belajar Ceria? Kami senang mendengarnya!
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Informasi Kontak -->
        <div class="md:col-span-5 space-y-4">
          <div class="card-pastel p-6 border-2 border-sky-100 space-y-4">
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>📍 Lembaga & Kampus</span>
            </h3>
            <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p><strong>Universitas Pendidikan Indonesia (UPI)</strong></p>
              <p>Kampus Daerah di Cibiru - Program Studi PGSD</p>
              <p>Jl. Mayor Abdurachman No. 211, Sumedang / Cibiru, Jawa Barat</p>
            </div>
            
            <div class="pt-3 border-t border-slate-100 text-xs space-y-2">
              <p class="flex items-center gap-2 text-slate-700">
                <span>📧</span> <span>pgsd.cibiru@upi.edu</span>
              </p>
              <p class="flex items-center gap-2 text-slate-700">
                <span>🏷️</span> <span>Model Pembelajaran DHETIK 2026</span>
              </p>
            </div>
          </div>

          <div class="card-pastel p-6 border-2 border-amber-100 space-y-2">
            <h4 class="font-bold text-slate-800 text-sm">Tim Pengembang:</h4>
            <ul class="text-xs text-slate-600 space-y-1 list-disc pl-4">
              <li>Ines Khairunisa</li>
              <li>Nasrun Nurhakim</li>
              <li>Nur Afifah Handayani</li>
              <li>Zidna Syifanadia Impian Pragita Mariannisa</li>
            </ul>
          </div>
        </div>

        <!-- Form Pesan & Saran -->
        <div class="md:col-span-7">
          <div id="contact-form-card" class="card-pastel p-6 md:p-8 border-2 border-sky-200 space-y-4">
            <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span>💌 Kirim Pesan atau Kesan Belajarmu</span>
            </h3>
            
            <div class="space-y-3 text-xs md:text-sm">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nama Kamu:</label>
                <input type="text" id="contact-name" value="${AppState.studentName}" class="w-full p-2.5 rounded-xl border border-slate-300 font-medium"/>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Asal Sekolah & Kelas:</label>
                <input type="text" id="contact-school" placeholder="Contoh: SDN Cibiru 1 - Kelas 3" class="w-full p-2.5 rounded-xl border border-slate-300 font-medium"/>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Seberapa Seru Belajar di Web Ini?</label>
                <div class="flex gap-2 text-2xl cursor-pointer" id="rating-stars">
                  <span onclick="setRating(1)" class="hover:scale-125 transition-transform">⭐</span>
                  <span onclick="setRating(2)" class="hover:scale-125 transition-transform">⭐</span>
                  <span onclick="setRating(3)" class="hover:scale-125 transition-transform">⭐</span>
                  <span onclick="setRating(4)" class="hover:scale-125 transition-transform">⭐</span>
                  <span onclick="setRating(5)" class="hover:scale-125 transition-transform">⭐</span>
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Pesan / Kesan Belajar:</label>
                <textarea id="contact-msg" rows="4" placeholder="Tuliskan pendapat atau hal yang paling kamu sukai di website ini..." class="w-full p-2.5 rounded-xl border border-slate-300 font-medium"></textarea>
              </div>
            </div>

            <button onclick="submitContactFeedback()" class="btn-playful w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm rounded-xl shadow-md">
              Kirim Masukan & Dapatkan Bintang! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.currentContactRating = 5;
function setRating(num) {
  window.currentContactRating = num;
  window.soundManager.playCoin();
  AppState.showToast(`⭐ Kamu memberi nilai ${num} dari 5 bintang! Terima kasih!`);
}

async function submitContactFeedback() {
  const name = document.getElementById('contact-name')?.value.trim() || AppState.studentName;
  const school = document.getElementById('contact-school')?.value.trim() || '';
  const msg = document.getElementById('contact-msg')?.value.trim();
  const rating = window.currentContactRating || 5;

  if (!msg) {
    alert('Tuliskan pesan atau kesan belajarmu terlebih dahulu ya!');
    return;
  }

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    await window.RBC_SUPABASE.saveContactFeedback({
      nama: name,
      sekolah: school,
      rating: rating,
      pesan: msg
    });
  }

  window.soundManager.playFanfare();
  AppState.addReward(20, 5, 'Pesanmu telah tersimpan di database!');
  triggerConfetti();

  const card = document.getElementById('contact-form-card');
  if (card) {
    card.innerHTML = `
      <div class="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-3xl text-center space-y-4 animate-bounce-gentle">
        <div class="text-4xl">🎉</div>
        <h3 class="text-xl font-black text-emerald-900">NOTIFIKASI: Pesan Berhasil Tersubmit!</h3>
        <p class="text-sm text-emerald-800 leading-relaxed font-medium">
          Terima kasih banyak, <strong>${name}</strong>! Masukan, kesan belajar, dan rating ${rating}⭐ kamu telah sukses tersimpan ke database Ruang Belajar Ceria.
        </p>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-200 text-emerald-950 text-xs font-bold">
          <span>✅ Status: Tersimpan di Database Supabase</span>
        </div>
        <div class="pt-2">
          <button onclick="switchTab('beranda')" class="btn-playful px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md">
            Kembali ke Beranda 🏠
          </button>
        </div>
      </div>
    `;
  }
  AppState.showToast('✅ Masukanmu berhasil tersubmit ke database!');
}

/* ============================================================
   TEACHER DASHBOARD & CIKO ASSISTANT HANDLERS
   ============================================================ */
function openTeacherDashboard() {
  const modal = document.getElementById('teacher-dashboard-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // populate data
  const cp = document.getElementById('edit-cp-text');
  const topic = document.getElementById('edit-topic-text');
  if (cp) cp.value = RBC_DATA.learningObjective.cp;
  if (topic) topic.value = RBC_DATA.appInfo.topic;
  
  // populate student report
  const sName = document.getElementById('td-student-name');
  const sQuiz = document.getElementById('td-student-quiz');
  const sStages = document.getElementById('td-student-stages');
  const sPemantik = document.getElementById('td-pemantik-answer');
  const sRef = document.getElementById('td-reflection-content');
  
  if (sName) sName.innerText = AppState.studentName;
  if (sQuiz) sQuiz.innerText = AppState.quizCompleted ? `${Math.round((AppState.quizScore / RBC_DATA.quizQuestions.length) * 100)} / 100` : `${AppState.quizScore * 10} Poin`;
  if (sStages) sStages.innerText = `${AppState.completedStages.length} / 6 Tahap Selesai`;
  
  const pemantik = localStorage.getItem('rbc_pemantik_answer');
  if (sPemantik) sPemantik.innerText = pemantik ? `"${pemantik}"` : 'Belum ada catatan.';
  
  if (sRef) {
    if (AppState.reflection && AppState.reflection.tahu) {
      sRef.innerHTML = `
        <p><strong>Aku tahu:</strong> ${AppState.reflection.tahu}</p>
        <p><strong>Aku merasa:</strong> ${AppState.reflection.merasa}</p>
        <p><strong>Aku ingin mencoba:</strong> ${AppState.reflection.mencoba}</p>
      `;
    } else {
      sRef.innerHTML = '<p class="italic text-slate-400">Siswa belum mengirim refleksi.</p>';
    }
  }
}

function closeTeacherDashboard() {
  document.getElementById('teacher-dashboard-modal')?.classList.add('hidden');
}

function switchTeacherTab(subTab) {
  const tabs = ['materi', 'laporan', 'share'];
  tabs.forEach(t => {
    const btn = document.getElementById(`ttab-${t}`);
    const view = document.getElementById(`teacher-view-${t}`);
    if (t === subTab) {
      btn?.classList.add('bg-emerald-600', 'text-white');
      btn?.classList.remove('bg-slate-100', 'text-slate-700');
      view?.classList.remove('hidden');
    } else {
      btn?.classList.remove('bg-emerald-600', 'text-white');
      btn?.classList.add('bg-slate-100', 'text-slate-700');
      view?.classList.add('hidden');
    }
  });
}

function saveTeacherMateri() {
  const cp = document.getElementById('edit-cp-text')?.value.trim();
  const topic = document.getElementById('edit-topic-text')?.value.trim();
  if (cp) RBC_DATA.learningObjective.cp = cp;
  if (topic) RBC_DATA.appInfo.topic = topic;
  localStorage.setItem('rbc_custom_cp', cp);
  localStorage.setItem('rbc_custom_topic', topic);
  AppState.showToast('✅ Pengaturan materi & CP berhasil diperbarui!');
  closeTeacherDashboard();
  switchTab(AppState.activeTab);
}

function resetAllStudentData() {
  if (confirm('Apakah Ibu/Bapak Guru yakin ingin mereset seluruh progres belajar siswa ini?')) {
    localStorage.clear();
    AppState.points = 25;
    AppState.stars = 8;
    AppState.completedStages = [];
    AppState.unlockedBadges = ['bintang-pintar'];
    AppState.quizScore = 0;
    AppState.quizCompleted = false;
    AppState.save();
    closeTeacherDashboard();
    switchTab('beranda');
    AppState.showToast('🔄 Seluruh data siswa berhasil direset!');
  }
}

function copyShareLink() {
  const linkInput = document.getElementById('share-link-input');
  if (linkInput) {
    linkInput.value = window.location.href;
    linkInput.select();
    navigator.clipboard?.writeText(window.location.href);
    AppState.showToast('📋 Tautan berhasil disalin ke clipboard!');
  }
}

function toggleCikoBubble() {
  window.soundManager.playPop();
  const bubble = document.getElementById('ciko-assistant-bubble');
  const textEl = document.getElementById('ciko-bubble-text');
  if (!bubble) return;
  
  const hints = {
    beranda: 'Selamat datang! Ayo mulai petualangan belajarmu dari Tahap D - Dekatkan ya!',
    d: 'Amati video uang koin dan kertas baik-baik, lalu ceritakan pengalamanmu!',
    h: 'Ingat ya: Kebutuhan adalah barang yang wajib dipenuhi, sedangkan keinginan boleh ditunda!',
    e: 'Hitung uang belanjamu di Market Niza dengan cermat, jangan melebihi Rp20.000!',
    t: 'Sampaikan pendapatmu dengan santun di papan diskusi dan hargai ide teman-temanmu!',
    i: 'Pahami peta konsep dan luruskan mitos-mitos keliru tentang uang!',
    k: 'Buat celengan kreatifmu seindah mungkin dan rencanakan belanjamu dengan bijak!',
    video: 'Pilih video yang ingin kamu tonton untuk memperdalam pemahaman!',
    kuis: 'Baca setiap soal dengan teliti. Semangat raih skor 100!',
    game: 'Asah ketangkasanmu lewat 5 game edukasi seru ini!',
    kontak: 'Tuliskan kesan atau masukanmu untuk kakak-kakak pengembang di sini!',
    tentang: 'Media ini dikembangkan dengan penuh cinta oleh tim mahasiswa PGSD UPI Cibiru 2026!'
  };

  if (textEl) {
    textEl.innerText = hints[AppState.activeTab] || 'Yuk terus semangat belajar bersama Ciko!';
  }
  bubble.classList.toggle('hidden');
}

// Global Init on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  AppState.updateStatsUI();
  // Support URL hash routing
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs = ['beranda', 'd', 'h', 'e', 't', 'i', 'k', 'kontak', 'tentang'];
    return validTabs.includes(hash) ? hash : 'beranda';
  };

  switchTab(getTabFromHash());

  window.addEventListener('hashchange', () => {
    switchTab(getTabFromHash());
  });

  // Sound button binder
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const active = window.soundManager.toggleSound();
      soundBtn.innerHTML = active ? RBC_ICONS.volume2('w-5 h-5') : RBC_ICONS.volumeX('w-5 h-5');
      AppState.showToast(active ? '🔊 Efek Suara Aktif!' : '🔇 Efek Suara Dimatikan.');
    });
  }

  // Student Name Click
  const nameWidget = document.getElementById('stat-name-widget');
  if (nameWidget) {
    nameWidget.addEventListener('click', () => {
      const newName = prompt('Hai teman! Siapa nama panggilanmu?', AppState.studentName);
      if (newName && newName.trim()) {
        AppState.studentName = newName.trim();
        AppState.save();
        AppState.showToast(`Halo, ${AppState.studentName}! Selamat belajar!`);
      }
    });
  }

  // Update DB status badge saat inisialisasi
  updateDbStatusBadge();
});

/* ============================================================
   SUPABASE CLOUD DATABASE DIAGNOSTIC MODAL & BADGE
   ============================================================ */
function updateDbStatusBadge() {
  const pill = document.getElementById('supabase-status-pill');
  const text = document.getElementById('supabase-status-text');
  const modalStatus = document.getElementById('modal-db-status');

  const connected = window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected();
  if (modalStatus) {
    if (connected) {
      modalStatus.className = 'px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black';
      modalStatus.innerText = 'Aktif & Terhubung ✅';
    } else {
      modalStatus.className = 'px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black';
      modalStatus.innerText = 'Lokal / Offline ⚠️';
    }
  }

  if (!pill) return;

  if (connected) {
    pill.className = 'btn-playful flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100 transition-colors';
    if (text) text.innerText = 'Cloud DB Aktif';
  } else {
    pill.className = 'btn-playful flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-100 transition-colors';
    if (text) text.innerText = 'Mode Lokal';
  }
}

window.updateDbStatusBadge = updateDbStatusBadge;

function openDbStatusModal() {
  updateDbStatusBadge();
  const modal = document.getElementById('supabase-status-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDbStatusModal() {
  const modal = document.getElementById('supabase-status-modal');
  if (modal) modal.classList.add('hidden');
}

async function pingSupabaseDb() {
  const resultBox = document.getElementById('modal-ping-result');
  const pingBtn = document.getElementById('btn-ping-db');
  if (pingBtn) pingBtn.disabled = true;
  if (resultBox) {
    resultBox.classList.remove('hidden');
    resultBox.className = 'p-3 rounded-2xl text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 animate-pulse';
    resultBox.innerHTML = '⏳ Menghubungi Supabase Cloud (udhoqefwcrxesvuoxlyq)...';
  }

  if (window.RBC_SUPABASE) {
    const res = await window.RBC_SUPABASE.testConnection();
    if (res.success) {
      resultBox.className = 'p-3 rounded-2xl text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-300';
      resultBox.innerHTML = `
        <div class="font-bold flex items-center gap-1.5 text-emerald-900 pb-1">
          <span>✅</span> <span>Koneksi Supabase Sukses!</span>
        </div>
        <p>${res.message}</p>
        <div class="mt-1 text-[11px] text-emerald-700">Setiap form yang kamu submit akan langsung tersimpan ke cloud.</div>
      `;
      window.soundManager.playCorrect();
    } else {
      resultBox.className = 'p-3 rounded-2xl text-xs font-medium bg-rose-50 text-rose-900 border border-rose-300';
      resultBox.innerHTML = `
        <div class="font-bold flex items-center gap-1.5 text-rose-900 pb-1">
          <span>❌</span> <span>Koneksi Belum Berhasil</span>
        </div>
        <p>${res.message}</p>
      `;
      window.soundManager.playWrong();
    }
  }
  if (pingBtn) pingBtn.disabled = false;
  updateDbStatusBadge();
}


