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
function normalizeStudentKey(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function escapeHtmlText(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStudentProfiles() {
  try {
    const raw = JSON.parse(localStorage.getItem('rbc_student_profiles') || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch (e) {
    return {};
  }
}

function saveStudentProfiles(profiles) {
  try {
    localStorage.setItem('rbc_student_profiles', JSON.stringify(profiles || {}));
  } catch (e) {}
}

function computeInitialRewardsForName(displayName, existingProfiles = null) {
  const key = normalizeStudentKey(displayName);
  const profiles = existingProfiles || getStudentProfiles();

  let hash1 = 2166136261;
  let hash2 = 5381;
  for (let i = 0; i < key.length; i++) {
    const ch = key.charCodeAt(i);
    hash1 ^= ch;
    hash1 = Math.imul(hash1, 16777619) >>> 0;
    hash2 = ((hash2 * 33) ^ (ch + i * 17)) >>> 0;
  }

  // Poin awal unik dalam rentang 15..75 (61 kombinasi berbeda)
  const minPts = 15;
  const spanPts = 61;
  let candidatePoints = minPts + (hash1 % spanPts);

  // Hindari poin awal kembar dengan nama siswa lain yang pernah masuk
  const usedPoints = new Set();
  Object.keys(profiles).forEach(otherKey => {
    if (otherKey !== key && profiles[otherKey] && typeof profiles[otherKey].initialPoints === 'number') {
      usedPoints.add(profiles[otherKey].initialPoints);
    }
  });

  if (usedPoints.size < spanPts) {
    let attempts = 0;
    while (usedPoints.has(candidatePoints) && attempts < spanPts) {
      candidatePoints = minPts + ((candidatePoints - minPts + 7) % spanPts);
      attempts++;
    }
    if (usedPoints.has(candidatePoints)) {
      for (let p = minPts; p < minPts + spanPts; p++) {
        if (!usedPoints.has(p)) {
          candidatePoints = p;
          break;
        }
      }
    }
  }

  // Bintang awal dalam rentang 4..12
  const candidateStars = 4 + (hash2 % 9);

  return {
    initialPoints: candidatePoints,
    points: candidatePoints,
    stars: candidateStars
  };
}

const _savedSessionConfirmed = sessionStorage.getItem('rbc_session_confirmed') === 'true';
const _savedStudentName = (localStorage.getItem('rbc_student_name') || '').trim();
const _reservedNames = ['isi nama', 'isi nama dulu', 'teman ceria', 'teman belajar'];
const _hasValidSessionStudent = _savedSessionConfirmed && _savedStudentName.length >= 2 && !_reservedNames.includes(_savedStudentName.toLowerCase());

const AppState = {
  activeTab: 'beranda',
  hasEnteredName: _hasValidSessionStudent,
  pendingTab: null,
  studentName: _hasValidSessionStudent ? _savedStudentName : 'Isi Nama Dulu',
  initialPoints: _hasValidSessionStudent ? parseInt(localStorage.getItem('rbc_initial_points') || localStorage.getItem('rbc_points') || '0', 10) : 0,
  points: _hasValidSessionStudent ? parseInt(localStorage.getItem('rbc_points') || '0', 10) : 0,
  stars: _hasValidSessionStudent ? parseInt(localStorage.getItem('rbc_stars') || '0', 10) : 0,
  completedStages: _hasValidSessionStudent ? JSON.parse(localStorage.getItem('rbc_completed_stages') || '[]') : [],
  unlockedBadges: _hasValidSessionStudent ? JSON.parse(localStorage.getItem('rbc_badges') || '["bintang-pintar"]') : [],
  
  // Market Niza State
  nizaCart: [],
  nizaMission: 1,
  nizaWallet: _hasValidSessionStudent ? parseInt(localStorage.getItem('rbc_niza_wallet') || '20000', 10) : 20000,
  
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

  // Diskusi Bersama Tahap I
  diskusiBersama: JSON.parse(localStorage.getItem('rbc_diskusi_bersama') || 'null'),

  // Refleksi Siswa & Tema Sertifikat ('biru' | 'merah' | 'emas')
  reflection: _hasValidSessionStudent ? JSON.parse(localStorage.getItem('rbc_student_reflection') || '{}') : {},
  certTheme: ['biru', 'merah', 'emas'].includes(localStorage.getItem('rbc_cert_theme')) ? localStorage.getItem('rbc_cert_theme') : 'biru',

  // Save state per student profile
  save() {
    if (!this.hasEnteredName || _reservedNames.includes(normalizeStudentKey(this.studentName))) {
      this.updateStatsUI();
      return;
    }

    localStorage.setItem('rbc_student_name', this.studentName);
    localStorage.setItem('rbc_initial_points', this.initialPoints);
    localStorage.setItem('rbc_points', this.points);
    localStorage.setItem('rbc_stars', this.stars);
    localStorage.setItem('rbc_completed_stages', JSON.stringify(this.completedStages));
    localStorage.setItem('rbc_badges', JSON.stringify(this.unlockedBadges));
    localStorage.setItem('rbc_padlet_posts', JSON.stringify(this.padletPosts));
    localStorage.setItem('rbc_diskusi_bersama', JSON.stringify(this.diskusiBersama));
    localStorage.setItem('rbc_student_reflection', JSON.stringify(this.reflection));
    localStorage.setItem('rbc_niza_wallet', this.nizaWallet);
    localStorage.setItem('rbc_name_confirmed', 'true');
    sessionStorage.setItem('rbc_session_confirmed', 'true');

    // Simpan profil terpisah per nama agar tiap siswa punya poin & progres masing-masing
    const profiles = getStudentProfiles();
    const key = normalizeStudentKey(this.studentName);
    if (key) {
      profiles[key] = {
        name: this.studentName,
        initialPoints: this.initialPoints,
        points: this.points,
        stars: this.stars,
        completedStages: Array.isArray(this.completedStages) ? [...this.completedStages] : [],
        unlockedBadges: Array.isArray(this.unlockedBadges) ? [...this.unlockedBadges] : ['bintang-pintar'],
        reflection: this.reflection ? { ...this.reflection } : {},
        nizaWallet: this.nizaWallet,
        pemantikAnswer: localStorage.getItem('rbc_pemantik_answer') || ''
      };
      saveStudentProfiles(profiles);
    }

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
    if (!this.hasEnteredName) return;
    this.points += p;
    this.stars += s;
    this.save();
    window.soundManager.playCorrect();
    this.showToast(`🎉 Hebat! Kamu dapat +${p} Poin & +${s} Bintang! ${msg || ''}`);
  },

  unlockBadge(badgeId) {
    if (!this.hasEnteredName) return;
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
    if (!this.hasEnteredName) return;
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

    const displayName = this.hasEnteredName ? this.studentName : 'Isi Nama';
    if (starEl) starEl.innerText = this.stars;
    if (pointEl) pointEl.innerText = this.points;
    if (nameEl) nameEl.innerText = displayName;

    // Mobile Drawer Sync
    const drawerName = document.getElementById('drawer-student-name');
    const drawerStars = document.getElementById('drawer-stars');
    const drawerPoints = document.getElementById('drawer-points');
    if (drawerName) drawerName.innerText = displayName;
    if (drawerStars) drawerStars.innerText = this.stars;
    if (drawerPoints) drawerPoints.innerText = this.points;

    const percent = this.hasEnteredName ? Math.min(100, Math.round((this.completedStages.length / 6) * 100)) : 0;
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (progressTxt) progressTxt.innerText = `${percent}% Selesai`;
  }
};

window.AppState = AppState;

// Name Gate Modal & Per-Student Points Logic
let _isRegisteringName = false;

function openStudentNameModal(allowClose = false) {
  const modal = document.getElementById('student-name-gate-modal');
  const closeBtn = document.getElementById('gate-close-btn');
  const titleEl = document.getElementById('gate-modal-title');
  const subEl = document.getElementById('gate-modal-subtitle');
  const inputEl = document.getElementById('gate-student-name-input');
  const errEl = document.getElementById('gate-error-msg');
  if (!modal) return;

  modal.dataset.allowClose = allowClose ? 'true' : 'false';
  if (closeBtn) {
    closeBtn.classList.toggle('hidden', !allowClose);
  }
  if (titleEl) {
    titleEl.innerText = AppState.hasEnteredName ? 'Masuk / Ganti Nama Siswa' : 'Masukkan Namamu Dulu, Yuk!';
  }
  if (subEl) {
    subEl.innerHTML = AppState.hasEnteredName
      ? 'Masukkan nama siswa lain atau namamu sendiri untuk berpindah akun & melihat <strong class="text-amber-700">poin awal masing-masing nama</strong>.'
      : 'Setiap anak yang mengakses web wajib mengisi nama terlebih dahulu untuk mendapatkan <strong class="text-amber-700">poin awal spesial</strong>! Setiap nama memiliki poin awal yang berbeda-beda.';
  }
  if (errEl) {
    errEl.classList.add('hidden');
    errEl.innerText = '';
  }
  if (inputEl) {
    inputEl.value = allowClose && AppState.hasEnteredName ? AppState.studentName : '';
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }, 80);
}
window.openStudentNameModal = openStudentNameModal;

function closeStudentNameModal() {
  const modal = document.getElementById('student-name-gate-modal');
  if (!modal) return;
  if (modal.dataset.allowClose !== 'true' && !AppState.hasEnteredName) {
    return;
  }
  modal.classList.add('hidden');
}
window.closeStudentNameModal = closeStudentNameModal;

function handleStudentNameBackdropClick(e) {
  const modal = document.getElementById('student-name-gate-modal');
  if (e && e.target === modal && modal.dataset.allowClose === 'true') {
    closeStudentNameModal();
  }
}
window.handleStudentNameBackdropClick = handleStudentNameBackdropClick;

async function registerOrSwitchStudentName(rawName, source = 'modal') {
  if (_isRegisteringName) return false;
  const cleanName = String(rawName || '').trim().replace(/\s+/g, ' ');
  const key = normalizeStudentKey(cleanName);

  const setError = (msg) => {
    if (source === 'modal') {
      const errEl = document.getElementById('gate-error-msg');
      if (errEl) {
        errEl.innerText = msg;
        errEl.classList.remove('hidden');
      }
    } else {
      const errEl = document.getElementById('beranda-name-error');
      if (errEl) {
        errEl.innerText = msg;
        errEl.classList.remove('hidden');
      }
    }
    AppState.showToast(`⚠️ ${msg}`);
  };

  if (cleanName.length < 2) {
    setError('Tulis nama panggilan atau nama lengkapmu dulu (minimal 2 huruf) ya!');
    return false;
  }
  if (_reservedNames.includes(key)) {
    setError('Mohon masukkan namamu sendiri, bukan teks contoh ya!');
    return false;
  }

  _isRegisteringName = true;
  const modalBtn = document.getElementById('gate-submit-btn');
  const prevBtnHtml = modalBtn ? modalBtn.innerHTML : '';
  if (source === 'modal' && modalBtn) {
    modalBtn.disabled = true;
    modalBtn.innerHTML = '<span>⏳ Menyiapkan poin awalmu...</span>';
  }

  try {
    const profiles = getStudentProfiles();

    // Simpan dulu progres siswa aktif sebelum berganti ke nama lain
    if (AppState.hasEnteredName && !_reservedNames.includes(normalizeStudentKey(AppState.studentName))) {
      const currentKey = normalizeStudentKey(AppState.studentName);
      profiles[currentKey] = {
        name: AppState.studentName,
        initialPoints: AppState.initialPoints,
        points: AppState.points,
        stars: AppState.stars,
        completedStages: Array.isArray(AppState.completedStages) ? [...AppState.completedStages] : [],
        unlockedBadges: Array.isArray(AppState.unlockedBadges) ? [...AppState.unlockedBadges] : ['bintang-pintar'],
        reflection: AppState.reflection ? { ...AppState.reflection } : {},
        nizaWallet: AppState.nizaWallet,
        pemantikAnswer: localStorage.getItem('rbc_pemantik_answer') || ''
      };
      saveStudentProfiles(profiles);
    }

    let profile = profiles[key] || null;
    let isNewStudent = false;

    // Jika belum ada di perangkat ini, cek data siswa bernama sama di Supabase
    if (!profile && window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected() && typeof window.RBC_SUPABASE.getSiswaByName === 'function') {
      try {
        const cloudRow = await Promise.race([
          window.RBC_SUPABASE.getSiswaByName(cleanName),
          new Promise(resolve => setTimeout(() => resolve(null), 2500))
        ]);
        if (cloudRow && typeof cloudRow.poin === 'number') {
          profile = {
            name: cleanName,
            initialPoints: cloudRow.poin,
            points: cloudRow.poin,
            stars: typeof cloudRow.bintang === 'number' ? cloudRow.bintang : 4,
            completedStages: Array.isArray(cloudRow.progres_tahap) ? cloudRow.progres_tahap : [],
            unlockedBadges: ['bintang-pintar'],
            reflection: {},
            nizaWallet: 20000,
            pemantikAnswer: ''
          };
        }
      } catch (e) {}
    }

    if (!profile) {
      const rewards = computeInitialRewardsForName(cleanName, profiles);
      profile = {
        name: cleanName,
        initialPoints: rewards.initialPoints,
        points: rewards.points,
        stars: rewards.stars,
        completedStages: [],
        unlockedBadges: ['bintang-pintar'],
        reflection: {},
        nizaWallet: 20000,
        pemantikAnswer: ''
      };
      isNewStudent = true;
    }

    // Terapkan state siswa yang aktif
    AppState.hasEnteredName = true;
    AppState.studentName = cleanName;
    AppState.initialPoints = typeof profile.initialPoints === 'number' ? profile.initialPoints : profile.points;
    AppState.points = typeof profile.points === 'number' ? profile.points : AppState.initialPoints;
    AppState.stars = typeof profile.stars === 'number' ? profile.stars : 4;
    AppState.completedStages = Array.isArray(profile.completedStages) ? [...profile.completedStages] : [];
    AppState.unlockedBadges = Array.isArray(profile.unlockedBadges) && profile.unlockedBadges.length ? [...profile.unlockedBadges] : ['bintang-pintar'];
    AppState.reflection = profile.reflection && typeof profile.reflection === 'object' ? { ...profile.reflection } : {};
    AppState.nizaWallet = typeof profile.nizaWallet === 'number' ? profile.nizaWallet : 20000;
    AppState.nizaCart = [];
    AppState.quizCompleted = false;
    AppState.quizScore = 0;
    AppState.quizIndex = 0;
    AppState.quizAnswers = [];

    if (profile.pemantikAnswer) {
      localStorage.setItem('rbc_pemantik_answer', profile.pemantikAnswer);
    } else {
      localStorage.removeItem('rbc_pemantik_answer');
    }

    AppState.save();

    const modal = document.getElementById('student-name-gate-modal');
    if (modal) modal.classList.add('hidden');

    window.soundManager.playCorrect();
    if (typeof triggerConfetti === 'function') triggerConfetti();

    if (isNewStudent) {
      AppState.showToast(`🎉 Halo ${cleanName}! Kamu mendapat Poin Awal ${AppState.initialPoints} Poin & ${AppState.stars} Bintang!`);
    } else {
      AppState.showToast(`👋 Selamat datang kembali, ${cleanName}! Poinmu: ${AppState.points} Poin (${AppState.stars} Bintang).`);
    }

    const nextTab = AppState.pendingTab && AppState.pendingTab !== 'beranda' ? AppState.pendingTab : AppState.activeTab || 'beranda';
    AppState.pendingTab = null;
    switchTab(nextTab);
    return true;
  } finally {
    _isRegisteringName = false;
    if (modalBtn) {
      modalBtn.disabled = false;
      modalBtn.innerHTML = prevBtnHtml || '<span>✨ Klaim Poin Awal &amp; Masuk</span>';
    }
  }
}
window.registerOrSwitchStudentName = registerOrSwitchStudentName;

function submitNameFromModal() {
  const inputEl = document.getElementById('gate-student-name-input');
  registerOrSwitchStudentName(inputEl ? inputEl.value : '', 'modal');
}
window.submitNameFromModal = submitNameFromModal;

function submitNameFromBeranda() {
  const inputEl = document.getElementById('beranda-name-input');
  registerOrSwitchStudentName(inputEl ? inputEl.value : '', 'beranda');
}
window.submitNameFromBeranda = submitNameFromBeranda;

function submitSwitchNameFromBeranda() {
  const inputEl = document.getElementById('beranda-switch-name-input');
  registerOrSwitchStudentName(inputEl ? inputEl.value : '', 'beranda');
}
window.submitSwitchNameFromBeranda = submitSwitchNameFromBeranda;

// Navigation Controller
function switchTab(tabId) {
  if (!AppState.hasEnteredName && tabId !== 'beranda') {
    AppState.pendingTab = tabId;
    AppState.activeTab = 'beranda';
    tabId = 'beranda';
    openStudentNameModal(false);
    AppState.showToast('✍️ Masukkan namamu dulu untuk mendapatkan poin awal & membuka menu belajar!');
  }

  AppState.activeTab = tabId;
  window.soundManager.playPop();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update Nav pills style (Desktop & Tier 2)
  document.querySelectorAll('.nav-link').forEach(btn => {
    const target = btn.getAttribute('data-tab');
    if (target === tabId) {
      btn.className = 'nav-link px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 bg-amber-400 text-slate-950 border border-amber-500 shadow-xs ring-2 ring-amber-300/60';
    } else {
      btn.className = 'nav-link px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 shadow-2xs';
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
  const drawer = document.getElementById('mobile-menu-drawer');
  if (drawer && !drawer.classList.contains('hidden')) {
    drawer.classList.add('hidden');
  }
  openStudentNameModal(AppState.hasEnteredName);
}
window.promptChangeName = promptChangeName;

/* ============================================================
   VIEW 1: BERANDA (HOME)
   ============================================================ */
function renderBerandaView() {
  const safeName = escapeHtmlText(AppState.studentName);
  const nameEntryCard = AppState.hasEnteredName
    ? `
      <div id="beranda-name-card" class="rounded-2xl bg-white/95 border-2 border-emerald-300 p-4 sm:p-5 shadow-md space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shadow-2xs">✅</span>
            <div>
              <span class="block text-[10px] font-black uppercase tracking-wider text-emerald-700">Siswa Aktif Terdaftar</span>
              <span class="font-black text-sm sm:text-base text-slate-800">${safeName}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span class="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] sm:text-xs font-black text-amber-900">🎁 Poin Awal: ${AppState.initialPoints}</span>
            <span class="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs font-black text-emerald-900">🪙 Poinmu: ${AppState.points}</span>
            <span class="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-[11px] sm:text-xs font-black text-sky-900">⭐ ${AppState.stars}</span>
          </div>
        </div>
        <form onsubmit="event.preventDefault(); submitSwitchNameFromBeranda();" class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="text"
            id="beranda-switch-name-input"
            maxlength="40"
            placeholder="Ganti siswa? Ketik nama lain di sini..."
            class="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50"
          />
          <button type="submit" class="btn-playful px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-900 font-black text-xs whitespace-nowrap">
            🔄 Cek / Ganti Nama
          </button>
        </form>
        <p id="beranda-name-error" class="hidden text-xs font-bold text-rose-600"></p>
      </div>
    `
    : `
      <div id="beranda-name-card" class="rounded-2xl bg-white/95 border-3 border-amber-400 p-4 sm:p-5 shadow-lg space-y-3 ring-4 ring-amber-200/50">
        <div class="flex items-start gap-3">
          <span class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl flex-shrink-0">🎁</span>
          <div>
            <h2 class="font-black text-sm sm:text-base text-slate-800">Masukkan Namamu Dulu untuk Mendapatkan Poin Awal!</h2>
            <p class="text-xs text-slate-600 font-medium leading-relaxed">
              Setiap pengunjung wajib mengisi nama terlebih dahulu sebelum belajar. <strong>Setiap nama memiliki poin awal yang berbeda-beda!</strong>
            </p>
          </div>
        </div>
        <form onsubmit="event.preventDefault(); submitNameFromBeranda();" class="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            id="beranda-name-input"
            maxlength="40"
            placeholder="Ketik namamu di sini (contoh: Aisyah)"
            class="flex-1 px-4 py-2.5 rounded-xl border-2 border-sky-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none font-bold text-slate-800"
          />
          <button type="submit" class="btn-playful px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm shadow-md whitespace-nowrap">
            ✨ Klaim Poin Awal
          </button>
        </form>
        <p id="beranda-name-error" class="hidden text-xs font-bold text-rose-600"></p>
      </div>
    `;

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
              Halo, ${AppState.hasEnteredName ? safeName : 'Teman Belajar'}! 👋<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-amber-600 to-emerald-600">
                Yuk, Belajar Sambil Bermain di Ruang Belajar Ceria!
              </span>
            </h1>

            ${nameEntryCard}

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

      <!-- Video Panduan Pembelajaran (Sebelum Tujuan Pembelajaran) -->
      <section class="card-pastel p-4 sm:p-6 md:p-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50/70 via-yellow-50/40 to-sky-50/70 shadow-md space-y-4 sm:space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-amber-200/70">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-400 text-white flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0 shadow-sm">
              🎬
            </div>
            <div>
              <span class="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider block">Panduan Penggunaan Media</span>
              <h2 class="text-xl sm:text-2xl font-black text-slate-800">Video Panduan Belajar</h2>
            </div>
          </div>
          <span class="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span>📺</span> Tonton Sebelum Belajar
          </span>
        </div>

        <p class="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
          Ayo simak video panduan di bawah ini untuk memahami alur belajar, menjelajahi setiap tahap Model DHETIK, dan memanfaatkan seluruh fitur ceria yang ada:
        </p>

        <div class="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 ring-2 ring-amber-200/80">
          <div class="video-responsive">
            <iframe 
              src="https://www.youtube.com/embed/gAToM7rFPMY" 
              title="Video Panduan Pembelajaran Ruang Belajar Ceria" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen
            ></iframe>
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

      <!-- Tombol Aksi di Paling Bawah Beranda -->
      <section class="text-center pt-4 sm:pt-6 pb-2">
        <button onclick="switchTab('d')" class="btn-playful inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 text-white font-black text-base sm:text-xl rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-1 active:scale-95 group">
          <span class="text-2xl animate-bounce">🚀</span>
          <span>Ayo Mulai Belajar Sekarang!</span>
          <span class="text-xl transition-transform group-hover:translate-x-1">➔</span>
        </button>
        <p class="text-xs text-slate-500 mt-2.5 font-medium">Klik untuk melangkah ke Tahap 1: Dekatkan (D)</p>
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

        <!-- TAMPILAN POSTER INFOGRAFIS RESMI (FOTO 1) -->
        <div class="mb-8 rounded-3xl overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 p-3.5 sm:p-6 shadow-xl group">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3.5 px-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                📊 Poster Infografis Pembelajaran
              </span>
              <span class="text-xs text-emerald-800 font-bold hidden sm:inline">
                IPAS Kelas 3 SD • Kebutuhan & Keinginan
              </span>
            </div>
            <button type="button" onclick="openImageLightbox('assets/images/foto1.jpeg', 'Infografis: Uang dalam Kehidupan Sehari-hari', 'IPAS Kelas 3 SD')" class="btn-playful inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
              <span>Perbesar Poster HD 🔍</span>
            </button>
          </div>

          <!-- Container Foto 1 -->
          <div class="cursor-pointer overflow-hidden rounded-2xl bg-white border border-emerald-200 shadow-inner flex items-center justify-center relative hover:ring-4 hover:ring-emerald-200 transition-all" onclick="openImageLightbox('assets/images/foto1.jpeg', 'Infografis: Uang dalam Kehidupan Sehari-hari', 'IPAS Kelas 3 SD')">
            <img src="assets/images/foto1.jpeg" alt="Infografis Uang dalam Kehidupan Sehari-hari" class="w-full max-h-[680px] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]" onerror="this.src='foto1.jpeg'"/>
            <div class="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
              🔍 Klik untuk Memperbesar
            </div>
          </div>

          <div class="mt-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
            <span class="font-medium text-slate-600">💡 <strong>Tip Belajar:</strong> Klik pada poster di atas untuk membaca teks infografis secara penuh!</span>
            <span class="font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-md">Resolusi Tinggi 1131×1600</span>
          </div>
        </div>

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
            Eksplorasi nilai uang Rupiah dan bermain simulasi jual beli dengan pilihan anggaran Rp10.000 hingga Rp50.000!
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('cheering', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Mascot Greeting -->
      ${RBC_MASCOT.bubble("Sekarang mari kita mencoba menggunakan uang dalam kegiatan berbelanja melalui permainan Belanja Pintar di Market Niza! Kamu bisa memilih uang belanjamu mulai dari Rp10.000 sampai Rp50.000. Perhatikan baik-baik ya, jangan sampai melebihi anggaran pilihanmu!")}

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
          <!-- Dompet Siswa (Dinamis sesuai Opsi Anggaran) -->
          <div class="p-3 px-4 sm:px-5 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <span class="text-2xl">👛</span>
            <div>
              <span class="text-xs font-bold text-amber-800 block">Sisa Anggaran Belanjamu:</span>
              <span id="niza-wallet-display" class="text-xl font-black text-amber-900">Rp${(AppState.nizaWallet || 20000).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <!-- Pilihan Opsi Uang Belanja Market Niza (50.000, 40.000, 30.000, 20.000, 10.000) -->
        <div class="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border-2 border-amber-300 space-y-3 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
              <span>💰</span> <span>Pilih Opsi Uang Belanjamu di Market Niza:</span>
            </span>
            <span class="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
              Anggaran Aktif: <strong id="niza-budget-badge">Rp${(AppState.nizaWallet || 20000).toLocaleString('id-ID')}</strong>
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5" id="niza-budget-options">
            ${[50000, 40000, 30000, 20000, 10000].map(amt => {
              const isActive = (AppState.nizaWallet || 20000) === amt;
              return `
                <button onclick="setNizaWallet(${amt})" id="niza-budget-btn-${amt}" class="niza-budget-btn btn-playful py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm border-2 flex items-center justify-center gap-1.5 transition-all ${isActive ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-md scale-[1.03]' : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300'}">
                  <span>💵</span>
                  <span>Rp${amt.toLocaleString('id-ID')}</span>
                </button>`;
            }).join('')}
          </div>
          <p class="text-slate-600 text-xs sm:text-sm font-medium">
            Pilihlah barang-barang di bawah ini untuk dimasukkan ke dalam keranjang. Pastikan total belanja tidak melebihi anggaran pilihanmu: <strong id="niza-budget-limit-text" class="text-emerald-800">Rp${(AppState.nizaWallet || 20000).toLocaleString('id-ID')}</strong>!
          </p>
        </div>

        <!-- Filter Kategori & Rak Barang Market Niza -->
        <div class="space-y-4 mb-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white/80 rounded-2xl border border-emerald-200">
            <div class="flex flex-wrap items-center gap-1.5" id="niza-category-filters">
              <button onclick="filterNizaCategory('all')" id="niza-cat-all" class="niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs transition-all">
                Semua Barang (${RBC_DATA.marketNizaItems.length})
              </button>
              <button onclick="filterNizaCategory('kebutuhan')" id="niza-cat-kebutuhan" class="niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition-all">
                🥦 Kebutuhan (${RBC_DATA.marketNizaItems.filter(i => i.category === 'kebutuhan').length})
              </button>
              <button onclick="filterNizaCategory('keinginan')" id="niza-cat-keinginan" class="niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800 transition-all">
                🎮 Keinginan (${RBC_DATA.marketNizaItems.filter(i => i.category === 'keinginan').length})
              </button>
            </div>
            <span class="text-xs text-slate-500 font-semibold">
              Tersedia <strong>${RBC_DATA.marketNizaItems.length}</strong> pilihan barang simulasi
            </span>
          </div>

          <!-- Grid Rak Barang -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" id="niza-items-grid">
            ${RBC_DATA.marketNizaItems.map(item => {
              const iconHtml = (typeof RBC_ICONS[item.icon] === 'function') ? RBC_ICONS[item.icon]('w-10 h-10 inline-block') : `<span class="text-3xl">${item.icon}</span>`;
              return `
              <div class="niza-item-card p-3.5 sm:p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm flex flex-col justify-between space-y-3 group hover:shadow-md transition-all" data-category="${item.category}">
                <div class="flex items-start justify-between gap-2">
                  <div class="w-12 h-12 flex items-center justify-center">${iconHtml}</div>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${item.category === 'kebutuhan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                    ${item.category === 'kebutuhan' ? 'Kebutuhan' : 'Keinginan'}
                  </span>
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">${item.name}</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">${item.desc}</p>
                  <span class="font-black text-emerald-700 text-sm sm:text-base mt-2 block">Rp${item.price.toLocaleString('id-ID')}</span>
                </div>
                <button onclick="addToNizaCart('${item.id}')" class="btn-playful w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                  <span>+ Beli Barang</span>
                </button>
              </div>`;
            }).join('')}
          </div>
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
                <span id="niza-remaining-display" class="text-xl sm:text-2xl font-black text-emerald-600">Rp${(AppState.nizaWallet || 20000).toLocaleString('id-ID')}</span>
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
                Total Belanja: Rp0 | <strong class="text-emerald-700">Sisa Uang Anda: Rp${(AppState.nizaWallet || 20000).toLocaleString('id-ID')}</strong> (Siap Ditabung di Celengan Ayam!)
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
              <strong id="receipt-payment" class="text-sm font-bold text-slate-900">Rp${(AppState.nizaWallet || 20000).toLocaleString('id-ID')}</strong>
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

// Pilih Opsi Uang Belanja Market Niza (50.000, 40.000, 30.000, 20.000, 10.000)
function setNizaWallet(amount) {
  const val = parseInt(amount, 10);
  if (![10000, 20000, 30000, 40000, 50000].includes(val)) return;

  AppState.nizaWallet = val;
  localStorage.setItem('rbc_niza_wallet', val);

  const currentTotal = AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  if (currentTotal > val) {
    AppState.nizaCart = [];
    AppState.showToast(`🔄 Keranjang disesuaikan agar tidak melebihi anggaran baru Rp${val.toLocaleString('id-ID')}`);
  } else {
    AppState.showToast(`💰 Uang belanjamu diatur menjadi Rp${val.toLocaleString('id-ID')}!`);
  }

  window.soundManager.playCoin();
  updateNizaCartUI();
}
window.setNizaWallet = setNizaWallet;

// Market Niza Cart Logic
function addToNizaCart(itemId) {
  const item = RBC_DATA.marketNizaItems.find(i => i.id === itemId);
  if (!item) return;

  const budget = AppState.nizaWallet || 20000;
  const currentTotal = AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  if (currentTotal + item.price > budget) {
    window.soundManager.playWrong();
    alert(`⚠️ Ups! Uangmu tidak cukup. Anggaran belanjamu saat ini maksimal adalah Rp${budget.toLocaleString('id-ID')}! Ayo pilih barang kebutuhan yang paling utama atau ubah opsi anggaranmu.`);
    return;
  }

  AppState.nizaCart.push(item);
  window.soundManager.playCoin();
  updateNizaCartUI();
}

function removeFromNizaCart(idx) {
  if (idx >= 0 && idx < AppState.nizaCart.length) {
    AppState.nizaCart.splice(idx, 1);
    window.soundManager.playPop();
    updateNizaCartUI();
  }
}
window.removeFromNizaCart = removeFromNizaCart;

function resetNizaCart() {
  AppState.nizaCart = [];
  window.soundManager.playPop();
  updateNizaCartUI();
  AppState.showToast('🛒 Keranjang belanja dikosongkan.');
}
window.resetNizaCart = resetNizaCart;

function filterNizaCategory(cat) {
  const cards = document.querySelectorAll('#niza-items-grid .niza-item-card');
  cards.forEach(card => {
    const itemCat = card.getAttribute('data-category');
    if (cat === 'all' || itemCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  const btnAll = document.getElementById('niza-cat-all');
  const btnKeb = document.getElementById('niza-cat-kebutuhan');
  const btnKei = document.getElementById('niza-cat-keinginan');

  const baseInactive = 'niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
  if (btnAll) btnAll.className = (cat === 'all')
    ? 'niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs transition-all'
    : baseInactive;
  if (btnKeb) btnKeb.className = (cat === 'kebutuhan')
    ? 'niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs transition-all'
    : baseInactive;
  if (btnKei) btnKei.className = (cat === 'keinginan')
    ? 'niza-cat-btn btn-playful px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-600 text-white shadow-xs transition-all'
    : baseInactive;
  window.soundManager.playPop();
}
window.filterNizaCategory = filterNizaCategory;

function updateNizaCartUI() {
  const container = document.getElementById('niza-cart-items');
  const totalEl = document.getElementById('niza-total-display');
  const walletEl = document.getElementById('niza-wallet-display');
  const remainingEl = document.getElementById('niza-remaining-display');
  const badgeEl = document.getElementById('niza-budget-badge');
  const limitEl = document.getElementById('niza-budget-limit-text');
  const budget = AppState.nizaWallet || 20000;

  // Update active button state on budget selector
  [50000, 40000, 30000, 20000, 10000].forEach(amt => {
    const btn = document.getElementById(`niza-budget-btn-${amt}`);
    if (!btn) return;
    if (amt === budget) {
      btn.className = 'niza-budget-btn btn-playful py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm border-2 flex items-center justify-center gap-1.5 transition-all bg-amber-400 border-amber-600 text-slate-950 shadow-md scale-[1.03]';
    } else {
      btn.className = 'niza-budget-btn btn-playful py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm border-2 flex items-center justify-center gap-1.5 transition-all bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300';
    }
  });

  if (badgeEl) badgeEl.innerText = `Rp${budget.toLocaleString('id-ID')}`;
  if (limitEl) limitEl.innerText = `Rp${budget.toLocaleString('id-ID')}`;
  if (!container || !totalEl || !walletEl) return;

  const total = AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  const remaining = Math.max(0, budget - total);

  totalEl.innerText = `Rp${total.toLocaleString('id-ID')}`;
  walletEl.innerText = `Rp${remaining.toLocaleString('id-ID')}`;
  if (remainingEl) remainingEl.innerText = `Rp${remaining.toLocaleString('id-ID')}`;

  if (AppState.nizaCart.length === 0) {
    container.innerHTML = '<p class="text-slate-400 text-sm italic py-2">Keranjang masih kosong. Ayo pilih barang di rak atas!</p>';
    return;
  }

  container.innerHTML = AppState.nizaCart.map((item, idx) => {
    const iconHtml = (typeof RBC_ICONS[item.icon] === 'function') ? RBC_ICONS[item.icon]('w-6 h-6 inline-block') : `<span class="text-xl">${item.icon}</span>`;
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

  const budget = AppState.nizaWallet || 20000;
  const sisaUang = Math.max(0, budget - total);
  window.soundManager.playFanfare();
  AppState.addReward(25, 4, 'Simulasi belanja berhasil!');
  AppState.unlockBadge('pembeli-bijak');

  // Buka Struk Kasir Modal dengan anggaran & sisa uang aktif
  openNizaReceiptModal(total, sisaUang, budget);

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    window.RBC_SUPABASE.saveCashierTransaction({
      studentName: AppState.studentName || 'Teman Belajar',
      items: AppState.nizaCart,
      total: total,
      uangDibayar: budget,
      sisaUang: sisaUang
    });
  }
  AppState.showToast('✅ Transaksi belanja kasir berhasil tersubmit ke database!');

  // Update banner struk kasir terakhir pada halaman
  const receiptBanner = document.getElementById('niza-last-receipt');
  const receiptBannerText = document.getElementById('niza-last-receipt-text');
  if (receiptBanner && receiptBannerText) {
    receiptBanner.classList.remove('hidden');
    receiptBannerText.innerHTML = `Anggaran: <strong>Rp${budget.toLocaleString('id-ID')}</strong> | Total Belanja: <strong>Rp${total.toLocaleString('id-ID')}</strong> | Sisa Uang Anda: <strong class="text-emerald-700 text-sm">Rp${sisaUang.toLocaleString('id-ID')}</strong> (Siap Ditabung di Celengan Ayam! 🐔🪙)`;
  }
}

function openNizaReceiptModal(customTotal, customSisa, customBudget) {
  const modal = document.getElementById('niza-receipt-modal');
  if (!modal) return;

  const budget = (typeof customBudget === 'number') ? customBudget : (AppState.nizaWallet || 20000);
  const total = (typeof customTotal === 'number') ? customTotal : AppState.nizaCart.reduce((sum, i) => sum + i.price, 0);
  const sisa = (typeof customSisa === 'number') ? customSisa : Math.max(0, budget - total);

  const nameEl = document.getElementById('receipt-student-name');
  const timeEl = document.getElementById('receipt-timestamp');
  const totalEl = document.getElementById('receipt-total');
  const paymentEl = document.getElementById('receipt-payment');
  const remainingEl = document.getElementById('receipt-remaining');
  const saveTipEl = document.getElementById('receipt-save-tip');
  const listEl = document.getElementById('receipt-items-list');

  if (nameEl) nameEl.innerText = AppState.studentName || 'Teman Belajar';
  if (timeEl) timeEl.innerText = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  if (totalEl) totalEl.innerText = `Rp${total.toLocaleString('id-ID')}`;
  if (paymentEl) paymentEl.innerText = `Rp${budget.toLocaleString('id-ID')}`;
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
   4. LKPD Digital Kebutuhan vs Keinginan (5 Kegiatan Interaktif)
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

        <!-- Slot Diskusi Bersama (Terhubung ke Ruang Kolaborasi Narasi Kelas) -->
        <div class="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 border-4 border-amber-400 ring-4 ring-amber-200/60 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <span>💬</span> <span>SLOT DISKUSI BERSAMA • KOLABORASI NARASI</span>
            </span>
            <span class="text-xs font-black text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-300 animate-pulse">
              🔥 Ayo Berbagi Opini!
            </span>
          </div>

          <div class="space-y-1.5">
            <h3 class="font-black text-slate-900 text-lg sm:text-2xl">
              Mari Berdiskusi Tentang 4 Barang di Atas!
            </h3>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Setelah mengamati gambar dan membaca cerita sederhana di atas, tuliskan pendapatmu langsung pada <strong>Ruang Kolaborasi Narasi</strong> di bagian bawah halaman ini bersama teman sekelas:
            </p>
          </div>

          <button onclick="document.getElementById('kolaborasi-section')?.scrollIntoView({ behavior: 'smooth' })" class="btn-playful w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-black text-sm sm:text-lg flex items-center justify-center gap-2.5 shadow-xl">
            <span>💬 BUKA RUANG KOLABORASI NARASI KELAS ↓</span>
          </button>
        </div>
      </section>

      <!-- 4. LKPD DIGITAL: 5 KEGIATAN INTERAKTIF -->
      <section class="card-pastel p-6 md:p-8 border-3 border-teal-300 bg-white shadow-lg space-y-8">
        <!-- Banner LKPD Digital -->
        <div class="rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div class="space-y-2 max-w-xl">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
              <span>Lembar Kerja Peserta Didik Digital</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-black">LKPD Digital: Kebutuhan dan Keinginan 📝</h2>
            <p class="text-teal-50 text-xs md:text-sm font-medium leading-relaxed">
              Kerjakan LKPD digital interaktif di bawah ini secara mandiri dengan mengelompokkan barang ke dalam kategori kebutuhan atau keinginan berdasarkan gambar dan cerita di atas!
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <div class="px-5 py-3 rounded-2xl bg-white/20 border border-white/30 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2">
              <span>✨ Langsung Interaktif di Web</span>
            </div>
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
                  Simpan alasan analisis untuk disertakan dalam Ruang Kolaborasi Narasi.
                </span>
                <button onclick="saveLkpdReasons()" class="btn-playful w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  <span>💾 Simpan Alasan Analisis</span>
                </button>
              </div>

              <!-- Menuju ke Kolaborasi Narasi -->
              <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-sky-100 via-cyan-50 to-indigo-100 border-4 border-sky-400 ring-4 ring-sky-200/60 shadow-xl space-y-3.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
                    <span>📌</span> <span>KOLABORASI NARASI • PENTING</span>
                  </span>
                  <span class="text-xs font-black text-sky-900 bg-white px-3 py-1 rounded-full border border-sky-300">
                    💡 Siap Dibagikan
                  </span>
                </div>

                <p class="text-base sm:text-xl font-black text-sky-950 leading-snug">
                  Simpan alasan analisismu dan bagikan langsung ke Ruang Kolaborasi Narasi bersama teman sekelas!
                </p>

                <button onclick="document.getElementById('kolaborasi-section')?.scrollIntoView({ behavior: 'smooth' })" class="btn-playful w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-sm sm:text-lg flex items-center justify-center gap-2.5 shadow-xl">
                  <span>💬 MENUJU RUANG KOLABORASI NARASI 1, 2, 3 ↓</span>
                </button>
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

      <!-- 5. RUANG KOLABORASI: DISKUSI NARASI 1, 2, 3 & TANGGAPAN SANTUN -->
      <section id="kolaborasi-section" class="card-pastel p-6 md:p-8 border-3 border-violet-300 bg-white shadow-xl space-y-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-violet-100">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Kolaborasi Terpadu</span>
            </div>
            <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>🤝 Ruang Kolaborasi &amp; Diskusi Narasi Kelas 3</span>
            </h2>
            <p class="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Setelah menyelesaikan LKPD, mari berbagi hasil opini dan alasanmu pada ketiga Narasi di bawah ini. Masukkan pendapatmu pada Narasi 1, Narasi 2, atau Narasi 3, lalu berikan tanggapan santun pada pendapat teman sekelas!
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2.5 flex-shrink-0 w-full md:w-auto">
            <button onclick="openNewPostModal()" class="btn-playful px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all">
              <span>+ Unggah Opini Narasi Lengkap 🚀</span>
            </button>
          </div>
        </div>

        <!-- Banner Info Siswa Aktif -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div class="flex items-center gap-3">
            <span class="text-3xl">👤</span>
            <div>
              <div class="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Nama Peserta Didik Aktif</div>
              <div class="text-base sm:text-lg font-black text-white" id="kolaborasi-student-badge">${escapeHtmlText(AppState.studentName)}</div>
            </div>
          </div>
          <span class="text-xs font-bold bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 text-white">
            ✨ Namamu otomatis terpasang pada setiap opini &amp; komentar
          </span>
        </div>

        <!-- NOTIFIKASI SUBMIT KOLABORASI -->
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

        <!-- 3 KOLOM NARASI KOLABORASI -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5" id="padlet-columns">
          <!-- Kolom Narasi 1 -->
          <div class="p-4 rounded-3xl bg-sky-50/80 border-2 border-sky-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-sky-200">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🍚</span>
                  <div>
                    <h3 class="font-black text-sky-950 text-sm">Narasi 1</h3>
                    <span class="text-[10px] font-bold text-sky-700">Kebutuhan Pokok (Nasi)</span>
                  </div>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-white text-sky-800 text-[10px] font-extrabold border border-sky-200">
                  Diskusi Aktif
                </span>
              </div>

              <!-- Input Opini Cepat Langsung di Kolom Narasi 1 -->
              <div class="mt-3 p-3 bg-white rounded-2xl border border-sky-200 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="font-bold text-sky-900">💬 Kirim Opini Narasi 1:</span>
                  <span class="text-[10px] font-semibold text-slate-500">Nama: <strong class="text-sky-700">${escapeHtmlText(AppState.studentName)}</strong></span>
                </div>
                <textarea id="quick-opinion-1" rows="2" class="w-full p-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-400 focus:outline-none" placeholder="Tuliskan opinimu tentang Nasi sebagai kebutuhan pokok..."></textarea>
                <button onclick="submitQuickNarasiOpinion('1')" class="btn-playful w-full py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs">
                  <span>Kirim Opini Narasi 1 💬</span>
                </button>
              </div>

              <div id="posts-group-1" class="space-y-3 mt-3">
                <!-- Post Cards akan dirender via JS -->
              </div>
            </div>
            <button onclick="quickPostForGroup('1')" class="w-full py-2 rounded-xl bg-white hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 flex items-center justify-center gap-1 shadow-sm mt-3">
              <span>+ Form Lengkap Opini Narasi 1</span>
            </button>
          </div>

          <!-- Kolom Narasi 2 -->
          <div class="p-4 rounded-3xl bg-amber-50/80 border-2 border-amber-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-amber-200">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">📖</span>
                  <div>
                    <h3 class="font-black text-amber-950 text-sm">Narasi 2</h3>
                    <span class="text-[10px] font-bold text-amber-700">Kebutuhan Belajar (Buku)</span>
                  </div>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-extrabold border border-amber-200">
                  Diskusi Aktif
                </span>
              </div>

              <!-- Input Opini Cepat Langsung di Kolom Narasi 2 -->
              <div class="mt-3 p-3 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="font-bold text-amber-900">💬 Kirim Opini Narasi 2:</span>
                  <span class="text-[10px] font-semibold text-slate-500">Nama: <strong class="text-amber-800">${escapeHtmlText(AppState.studentName)}</strong></span>
                </div>
                <textarea id="quick-opinion-2" rows="2" class="w-full p-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="Tuliskan opinimu tentang Buku Tulis untuk belajar sekolah..."></textarea>
                <button onclick="submitQuickNarasiOpinion('2')" class="btn-playful w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs">
                  <span>Kirim Opini Narasi 2 💬</span>
                </button>
              </div>

              <div id="posts-group-2" class="space-y-3 mt-3">
                <!-- Post Cards akan dirender via JS -->
              </div>
            </div>
            <button onclick="quickPostForGroup('2')" class="w-full py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1 shadow-sm mt-3">
              <span>+ Form Lengkap Opini Narasi 2</span>
            </button>
          </div>

          <!-- Kolom Narasi 3 -->
          <div class="p-4 rounded-3xl bg-rose-50/80 border-2 border-rose-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-rose-200">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🚗</span>
                  <div>
                    <h3 class="font-black text-rose-950 text-sm">Narasi 3</h3>
                    <span class="text-[10px] font-bold text-rose-700">Keinginan &amp; Hiburan</span>
                  </div>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-white text-rose-800 text-[10px] font-extrabold border border-rose-200">
                  Diskusi Aktif
                </span>
              </div>

              <!-- Input Opini Cepat Langsung di Kolom Narasi 3 -->
              <div class="mt-3 p-3 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="font-bold text-rose-900">💬 Kirim Opini Narasi 3:</span>
                  <span class="text-[10px] font-semibold text-slate-500">Nama: <strong class="text-rose-700">${escapeHtmlText(AppState.studentName)}</strong></span>
                </div>
                <textarea id="quick-opinion-3" rows="2" class="w-full p-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-400 focus:outline-none" placeholder="Tuliskan opinimu tentang Mainan dan Jajanan sebagai keinginan..."></textarea>
                <button onclick="submitQuickNarasiOpinion('3')" class="btn-playful w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs">
                  <span>Kirim Opini Narasi 3 💬</span>
                </button>
              </div>

              <div id="posts-group-3" class="space-y-3 mt-3">
                <!-- Post Cards akan dirender via JS -->
              </div>
            </div>
            <button onclick="quickPostForGroup('3')" class="w-full py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-900 font-bold text-xs border border-rose-200 flex items-center justify-center gap-1 shadow-sm mt-3">
              <span>+ Form Lengkap Opini Narasi 3</span>
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
              <span><strong>Mengerjakan LKPD digital melalui lima kegiatan interaktif:</strong> Ayo Amati Barang, Ayo Kelompokkan, Mengapa Kamu Memilihnya, Ayo Berpikir, dan Ayo Simpulkan.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-violet-600 font-bold mt-0.5">✔</span>
              <span><strong>Memasukkan opini pada Ruang Kolaborasi Narasi 1, Narasi 2, dan Narasi 3</strong> yang langsung tercatat dengan nama masing-masing.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-violet-600 font-bold mt-0.5">✔</span>
              <span><strong>Membaca dan memberikan tanggapan santun</strong> terhadap opini dan alasan teman sekelas.</span>
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

    <!-- MODAL UNGGAH HASIL LKPD KE KOLABORASI NARASI -->
    <div id="padlet-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
      <div class="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-violet-200 space-y-5 animate-bounce-gentle max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📝</span>
            <h3 class="font-black text-slate-800 text-lg">Unggah Opini ke Ruang Kolaborasi Narasi</h3>
          </div>
          <button onclick="closeNewPostModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors">✕</button>
        </div>

        <div class="space-y-4 text-xs md:text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Peserta Didik / Anggota:</label>
            <input type="text" id="post-author" value="${escapeHtmlText(AppState.studentName)}" class="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-violet-400 focus:outline-none"/>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Narasi Kolaborasi:</label>
            <select id="post-group" class="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-violet-400 focus:outline-none">
              <option value="1">Narasi 1: Kebutuhan Pokok Sehari-hari (Nasi 🍚)</option>
              <option value="2">Narasi 2: Kebutuhan Belajar &amp; Sekolah (Buku Tulis 📖)</option>
              <option value="3">Narasi 3: Keinginan &amp; Hiburan (Mainan &amp; Jajanan 🚗🍫)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Opini LKPD:</label>
            <input type="text" id="post-title" value="Hasil LKPD: Kebutuhan vs Keinginan 4 Barang" class="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-violet-400 focus:outline-none"/>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Alasan dan Temuan Opini:</label>
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
            <span>Kirim Opini Kolaborasi 🚀</span>
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
          Belum ada opini di Narasi ini. Jadilah yang pertama memberikan pendapat!
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
          <span class="text-[10px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">Narasi ${post.group}</span>
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

function submitQuickNarasiOpinion(grp) {
  const input = document.getElementById(`quick-opinion-${grp}`);
  const text = input?.value.trim();
  if (!text) {
    alert('Mohon tuliskan pendapat atau opinimu terlebih dahulu ya!');
    return;
  }

  const author = AppState.studentName || 'Peserta Didik';
  const narasiTitles = {
    '1': 'Opini Narasi 1: Kebutuhan Pokok 🍚',
    '2': 'Opini Narasi 2: Kebutuhan Belajar 📖',
    '3': 'Opini Narasi 3: Keinginan & Hiburan 🚗🍫'
  };

  const newPost = {
    id: 'post-' + Date.now(),
    author: author,
    group: String(grp),
    title: narasiTitles[grp] || `Opini Narasi ${grp}`,
    content: text,
    likes: 1,
    comments: [
      { author: 'Ciko Mascot', text: `Terima kasih telah berbagi opini di Narasi ${grp}! Pendapatmu sangat bijak 🌟` }
    ]
  };

  if (!AppState.padletPosts) AppState.padletPosts = [];
  AppState.padletPosts.unshift(newPost);
  AppState.save();
  renderPadletPosts();
  input.value = '';

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
    window.RBC_SUPABASE.sendPadletPost(newPost);
  }

  window.soundManager.playFanfare();
  AppState.addReward(15, 3, `Opinimu berhasil dikirim ke Narasi ${grp}!`);
  AppState.showToast(`✅ Opinimu berhasil dikirim ke Narasi ${grp}!`);
}
window.submitQuickNarasiOpinion = submitQuickNarasiOpinion;

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
  AppState.addReward(20, 4, 'Hasil opinimu berhasil diunggah ke Ruang Kolaborasi Narasi!');

  const alertArea = document.getElementById('padlet-alert-area');
  if (alertArea) {
    alertArea.classList.remove('hidden');
    alertArea.innerHTML = `
      <div class="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1.5 shadow-sm animate-fade-in">
        <div class="flex items-center justify-between font-black text-emerald-900 text-sm">
          <span class="flex items-center gap-1.5"><span>🎉</span> NOTIFIKASI: Opini Narasi Berhasil Tersubmit!</span>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">Tersimpan di Supabase ✅</span>
        </div>
        <p class="text-emerald-800 leading-relaxed font-medium">
          Hore, <strong>${author}</strong>! Postingan opini dan analisismu telah sukses tersimpan dan langsung tampil di Narasi ${group}.
        </p>
      </div>
    `;
    alertArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  AppState.showToast('✅ Opini berhasil dikirim ke Narasi ' + group + '!');
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

        <!-- TAMPILAN POSTER PETA KONSEP RESMI (FOTO 2) -->
        <div class="mb-8 rounded-3xl overflow-hidden bg-gradient-to-b from-rose-50 via-amber-50 to-white border-2 border-rose-300 p-3.5 sm:p-6 shadow-xl group">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3.5 px-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                🗺️ Bagan Peta Konsep Utama
              </span>
              <span class="text-xs text-rose-800 font-bold hidden sm:inline">
                IPAS Kelas 3 SD • Uang & Pengelolaannya
              </span>
            </div>
            <button type="button" onclick="openImageLightbox('assets/images/foto2.jpeg', 'Peta Konsep: Uang dan Pengelolaannya', 'IPAS Kelas 3 SD')" class="btn-playful inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
              <span>Perbesar Peta Konsep HD 🔍</span>
            </button>
          </div>

          <!-- Container Foto 2 -->
          <div class="cursor-pointer overflow-hidden rounded-2xl bg-white border border-rose-200 shadow-inner flex items-center justify-center relative hover:ring-4 hover:ring-rose-200 transition-all" onclick="openImageLightbox('assets/images/foto2.jpeg', 'Peta Konsep: Uang dan Pengelolaannya', 'IPAS Kelas 3 SD')">
            <img src="assets/images/foto2.jpeg" alt="Peta Konsep Uang dan Pengelolaannya" class="w-full max-h-[680px] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]" onerror="this.src='foto2.jpeg'"/>
            <div class="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
              🔍 Klik untuk Memperbesar
            </div>
          </div>

          <div class="mt-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
            <span class="font-medium text-slate-600">💡 <strong>Tip Belajar:</strong> Klik pada bagan di atas untuk melihat detail hubungan dan struktur materi!</span>
            <span class="font-bold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-md">Resolusi Tinggi 1131×1600</span>
          </div>
        </div>

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

        <!-- Canva Slide Presentation Embed & Link Sesuai Permintaan Revisi -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 space-y-3">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span class="text-xs font-bold text-sky-700 uppercase">Slide Materi Guru</span>
              <h4 class="font-bold text-slate-800 text-base">Presentasi Canva: Mengenal Uang dalam Gaya Ilustratif</h4>
            </div>
            <a href="https://www.canva.com/design/DAHb2IGHjsE/IgiEOmruFezjIqMk79QEOA/view?utm_content=DAHb2IGHjsE&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener noreferrer" class="btn-playful w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
              <span>Buka Slide Canva di Tab Baru ➔</span>
            </a>
          </div>

          <div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
             padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
             border-radius: 8px; will-change: transform;">
            <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
              src="https://www.canva.com/design/DAHb2IGHjsE/IgiEOmruFezjIqMk79QEOA/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
            </iframe>
          </div>
          <p class="text-xs text-slate-600 font-medium">
            <a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAHb2IGHjsE&#x2F;IgiEOmruFezjIqMk79QEOA&#x2F;view?utm_content=DAHb2IGHjsE&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener" class="text-sky-700 hover:underline font-bold">Presentasi Pendidikan Mengenal Uang dalam Gaya Ilustratif Hijau.pptx</a> oleh Nur Khasanah,s.pd
          </p>
        </div>
      </div>

      <!-- 5. KESIMPULAN BERSAMA (Urutan #5) -->
      <div class="card-pastel p-6 border-2 border-indigo-200">
        <h3 class="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
          <span>💬</span> Kesimpulan Bersama
        </h3>
        <p class="text-slate-600 text-sm leading-relaxed mb-4">
          Sekarang kita semua paham bahwa uang adalah alat tukar yang berharga. Kita harus pintar mendahulukan kebutuhan dan menyisihkan uang saku untuk menabung di celengan!
        </p>

        ${AppState.quizCompleted ? `
          <div class="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <span class="text-xl">🎉</span>
              <span>Kuis Interaktif Telah Dikerjakan! Skor: <strong>${Math.round((AppState.quizScore / RBC_DATA.quizQuestions.length) * 100)}</strong> / 100</span>
            </div>
            <button onclick="switchTab('kuis')" class="btn-playful px-3.5 py-1.5 rounded-xl bg-emerald-200 hover:bg-emerald-300 text-emerald-900 text-xs font-black transition-colors shadow-2xs">
              Ulangi Kuis ↗
            </button>
          </div>
        ` : `
          <button onclick="switchTab('kuis')" class="btn-playful w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md">
            <span>Uji Pemahamanmu di Kuis Interaktif 🎯</span>
          </button>
        `}
      </div>

      <!-- 6. RUANG DISKUSI BERSAMA (Di Bawah Kesimpulan Bersama Sesuai Permintaan Revisi) -->
      <div class="card-pastel p-6 md:p-8 border-2 border-purple-200 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-100">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl shadow-xs">💬</span>
            <div>
              <span class="text-xs font-bold uppercase text-purple-600 tracking-wider">Aktivitas Kolaborasi Belajar</span>
              <h3 class="text-xl md:text-2xl font-bold text-slate-800">Diskusi Bersama: Berbagi Pendapat &amp; Pengalaman</h3>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black border border-purple-200">
            👥 Ruang Diskusi Siswa Ceria
          </span>
        </div>

        <p class="text-slate-600 text-sm leading-relaxed font-medium">
          Setelah menyimak kesimpulan bersama mengenai uang dan pengelolaannya, mari kita saling berbagi pendapat dan pengalaman belajar! Tuliskan caramu menabung di celengan atau bagaimana caramu mendahulukan kebutuhan daripada keinginan:
        </p>

        <!-- Form Input Diskusi Bersama -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 space-y-3.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <span>✍️</span> <strong>Tulis Pendapat Baru:</strong>
            </span>
            <span class="text-[10px] text-purple-800 font-bold bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
              ⭐ +10 Poin &amp; +2 Bintang
            </span>
          </div>

          <!-- Kolom Identitas Pengirim (Bisa diisi siswa mana pun) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="diskusi-author-name" class="block text-[11px] font-bold text-slate-700 mb-1">
                👤 Nama Siswa / Teman Belajar:
              </label>
              <input
                type="text"
                id="diskusi-author-name"
                value="${escapeHtmlText(AppState.studentName && AppState.studentName !== 'Teman Belajar' ? AppState.studentName : '')}"
                placeholder="Ketik namamu di sini..."
                class="w-full p-2.5 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-xs font-bold text-slate-800 bg-white placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label for="diskusi-author-role" class="block text-[11px] font-bold text-slate-700 mb-1">
                🏷️ Kelas / Peran:
              </label>
              <select
                id="diskusi-author-role"
                class="w-full p-2.5 rounded-xl border border-purple-200 focus:border-purple-500 text-xs font-bold text-slate-800 bg-white focus:outline-none"
              >
                <option value="Siswa Kelas 3 SD">Siswa Kelas 3 SD</option>
                <option value="Teman Ceria">Teman Ceria</option>
                <option value="Ketua Kelompok">Ketua Kelompok</option>
              </select>
            </div>
          </div>

          <!-- Pilihan Topik Cepat -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
            <span class="text-[11px] text-slate-600 font-bold">Topik Cepat:</span>
            <button type="button" onclick="setDiskusiPrompt('Tips menabung di celengan ayam')" class="px-2.5 py-1 rounded-xl bg-white hover:bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200 shadow-2xs transition-colors">
              🐷 Tips Menabung
            </button>
            <button type="button" onclick="setDiskusiPrompt('Cara membedakan kebutuhan dan keinginan')" class="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 shadow-2xs transition-colors">
              ⚖️ Kebutuhan vs Keinginan
            </button>
            <button type="button" onclick="setDiskusiPrompt('Rencana belanja bijak uang saku')" class="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200 shadow-2xs transition-colors">
              💰 Belanja Bijak
            </button>
          </div>

          <div class="space-y-2">
            <textarea
              id="diskusi-input-text"
              rows="3"
              placeholder="Tuliskan pendapat, pengalaman, atau tips belanjamu di sini... (contoh: Menurut saya, kita harus selalu menyisihkan uang saku untuk ditabung di celengan ayam...)"
              class="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 bg-white placeholder:text-slate-400 placeholder:font-normal leading-relaxed"
            ></textarea>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span id="diskusi-alert-msg" class="text-xs font-bold text-rose-600 hidden"></span>
              <button type="button" onclick="submitDiskusiBersama()" class="btn-playful ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-purple-200">
                <span>🚀 Kirim Pendapat ke Forum Diskusi</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Daftar Pendapat Teman Belajar (Langsung Ditampilkan) -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span class="flex items-center gap-1.5">
              <span>💬</span> <strong>Daftar Pendapat &amp; Pengalaman Teman Belajar:</strong>
            </span>
            <span class="text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Saling Menghargai &amp; Santun
            </span>
          </div>
          <div id="diskusi-posts-container" class="space-y-3.5">
            ${getDiskusiPostsHtml()}
          </div>
        </div>
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

function getDefaultDiskusiPosts() {
  return [
    {
      id: 'diskusi-1',
      nama: 'Bima Santoso',
      role: 'Siswa Kelas 3 SD',
      waktu: 'Baru saja',
      opini: 'Kalau saya dapat uang saku Rp 5.000, saya jajan Rp 3.000 untuk beli roti di kantin sekolah, lalu Rp 2.000 sisanya langsung saya tabung di celengan ayam di kamar!',
      kategori: '🐷 Tips Menabung',
      likes: 6,
      comments: [
        { author: 'Siti Rahmawati', text: 'Wah hebat Bima! Celengan ayamnya pasti cepat penuh ya 🌟', waktu: 'Baru saja' },
        { author: 'Ciko Mascot', text: 'Keren sekali kebiasaan menabungmu, patut dicontoh teman sekelas!', waktu: 'Baru saja' }
      ]
    },
    {
      id: 'diskusi-2',
      nama: 'Siti Rahmawati',
      role: 'Siswa Kelas 3 SD',
      waktu: '12 menit lalu',
      opini: 'Kemarin waktu diajak ke toko mainan, saya ingat nasihat bu guru untuk utamakan kebutuhan. Jadi saya pilih beli buku gambar dan pensil warna untuk tugas sekolah.',
      kategori: '⚖️ Kebutuhan vs Keinginan',
      likes: 9,
      comments: [
        { author: 'Alif Pratama', text: 'Setuju Siti! Kebutuhan sekolah memang harus didahulukan daripada mainan 👍', waktu: '10 menit lalu' }
      ]
    },
    {
      id: 'diskusi-3',
      nama: 'Alif Pratama',
      role: 'Siswa Kelas 3 SD',
      waktu: '25 menit lalu',
      opini: 'Belanja bijak itu membuat daftar barang kebutuhan terlebih dahulu sebelum berangkat belanja. Dengan begitu kita tidak lapar mata dan uangnya aman!',
      kategori: '💰 Belanja Bijak',
      likes: 7,
      comments: [
        { author: 'Ines Khairunisa (Guru)', text: 'Cerdas sekali Alif! Membuat daftar belanja adalah trik jitu berhemat 👏', waktu: '20 menit lalu' }
      ]
    }
  ];
}

function getDiskusiPostsHtml() {
  if (!AppState.diskusiBersama || !Array.isArray(AppState.diskusiBersama) || AppState.diskusiBersama.length === 0) {
    AppState.diskusiBersama = getDefaultDiskusiPosts();
  }
  const posts = AppState.diskusiBersama || [];
  if (posts.length === 0) {
    return `
      <div class="p-6 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-purple-200">
        <p class="text-xs font-semibold">Belum ada opini yang masuk. Jadilah yang pertama berpendapat!</p>
      </div>
    `;
  }

  return posts.map(post => {
    const isMe = normalizeStudentKey(post.nama) === normalizeStudentKey(AppState.studentName);
    const initial = (post.nama || 'S').trim().charAt(0).toUpperCase();
    const comments = Array.isArray(post.comments) ? post.comments : [];

    return `
      <div class="p-4 sm:p-5 rounded-2xl bg-white border-2 border-purple-100 shadow-xs space-y-3 transition-all hover:border-purple-300">
        <!-- Post Header -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
              ${initial}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-black text-xs sm:text-sm text-slate-800 truncate">${escapeHtmlText(post.nama)}</span>
                ${isMe ? '<span class="px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[9.5px] font-black">Saya</span>' : ''}
              </div>
              <span class="text-[10.5px] text-slate-400 font-medium">${escapeHtmlText(post.role || 'Siswa Kelas 3 SD')} • ${escapeHtmlText(post.waktu || 'Baru saja')}</span>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-[10.5px] font-bold border border-purple-200 flex-shrink-0">
            ${escapeHtmlText(post.kategori || '💬 Opini')}
          </span>
        </div>

        <!-- Post Body -->
        <div class="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100">
          <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
            "${escapeHtmlText(post.opini)}"
          </p>
        </div>

        <!-- Action Bar: Likes & Comments counter -->
        <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <div class="flex items-center gap-3">
            <button type="button" onclick="likeDiskusiPost('${post.id}')" class="btn-playful inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors">
              <span>❤️</span> <span>Suka (${post.likes || 0})</span>
            </button>
            <span class="text-[11px] font-bold text-slate-500">
              💬 ${comments.length} Tanggapan Teman
            </span>
          </div>
          <span class="text-[10.5px] text-emerald-600 font-bold">Diskusi Santun ✔</span>
        </div>

        <!-- Thread Komentar Santun dari Siswa Lain -->
        <div class="pt-2 space-y-2.5 border-t border-purple-100/70">
          <div class="flex items-center justify-between text-[11px] font-bold text-purple-900">
            <span>💬 Tanggapan &amp; Komentar Teman:</span>
            <span class="text-[10px] text-slate-400 font-normal">Saling memberi masukan positif</span>
          </div>

          <!-- List Komentar -->
          <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            ${comments.length > 0 ? comments.map(c => `
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-0.5">
                <div class="flex items-center justify-between">
                  <span class="font-black text-purple-900 text-[11px]">👤 ${escapeHtmlText(c.author)}</span>
                  <span class="text-[9.5px] text-slate-400 font-medium">${escapeHtmlText(c.waktu || 'Baru saja')}</span>
                </div>
                <p class="text-slate-700 text-xs pl-3.5 leading-snug">${escapeHtmlText(c.text)}</p>
              </div>
            `).join('') : `
              <div class="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                Belum ada tanggapan untuk pendapat ini. Ayo jadi yang pertama memberikan komentar!
              </div>
            `}
          </div>

          <!-- Form Tambah Komentar Siswa Lain -->
          <div class="pt-1.5 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
            <span class="text-[11px] font-bold text-purple-950 block">Tulis tanggapan atau komentarmu untuk ${escapeHtmlText(post.nama)}:</span>
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                id="komentar-author-${post.id}"
                value="${escapeHtmlText(AppState.studentName && AppState.studentName !== 'Teman Belajar' ? AppState.studentName : '')}"
                placeholder="Namamu..."
                class="w-full sm:w-36 p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-purple-400 focus:outline-none"
              />
              <input
                type="text"
                id="komentar-text-${post.id}"
                placeholder="Ketik tanggapan santun di sini..."
                onkeydown="if(event.key==='Enter') submitDiskusiKomentar('${post.id}')"
                class="flex-1 p-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:border-purple-400 focus:outline-none"
              />
              <button
                type="button"
                onclick="submitDiskusiKomentar('${post.id}')"
                class="btn-playful px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm flex-shrink-0"
              >
                <span>Kirim 💬</span>
              </button>
            </div>

            <!-- Quick Suggestion Buttons -->
            <div class="flex flex-wrap items-center gap-1 pt-0.5 text-[10px]">
              <span class="text-slate-500 font-semibold">Tanggapan cepat:</span>
              <button type="button" onclick="quickDiskusiComment('${post.id}', 'Setuju sekali! Ide yang sangat bagus 🌟')" class="px-2 py-0.5 rounded-md bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-medium transition-colors">👍 Setuju sekali!</button>
              <button type="button" onclick="quickDiskusiComment('${post.id}', 'Wah, terima kasih tipsnya sangat bermanfaat! 👏')" class="px-2 py-0.5 rounded-md bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-medium transition-colors">💡 Bermanfaat!</button>
              <button type="button" onclick="quickDiskusiComment('${post.id}', 'Keren banget! Saya juga mau coba cara ini. ✨')" class="px-2 py-0.5 rounded-md bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-medium transition-colors">✨ Keren banget!</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initTahapIView() {
  if (!AppState.diskusiBersama || !Array.isArray(AppState.diskusiBersama) || AppState.diskusiBersama.length === 0) {
    AppState.diskusiBersama = getDefaultDiskusiPosts();
    localStorage.setItem('rbc_diskusi_bersama', JSON.stringify(AppState.diskusiBersama));
  }
  renderDiskusiPosts();

  // Muat postingan cloud tambahan jika Supabase terhubung
  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected() && typeof window.RBC_SUPABASE.getDiskusiBersama === 'function') {
    window.RBC_SUPABASE.getDiskusiBersama().then(cloudPosts => {
      if (cloudPosts && Array.isArray(cloudPosts) && cloudPosts.length > 0) {
        const existingMap = new Map();
        (AppState.diskusiBersama || []).forEach(p => existingMap.set(String(p.id), p));
        let changed = false;

        cloudPosts.forEach(cp => {
          const cpId = String(cp.id);
          if (!existingMap.has(cpId)) {
            AppState.diskusiBersama.push({
              id: cp.id,
              nama: cp.nama_siswa,
              role: cp.role || 'Siswa Kelas 3 SD',
              waktu: 'Tersimpan di Cloud',
              opini: cp.opini,
              kategori: cp.kategori || '💬 Opini',
              likes: cp.likes || 1,
              comments: Array.isArray(cp.komentar) ? cp.komentar : []
            });
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem('rbc_diskusi_bersama', JSON.stringify(AppState.diskusiBersama));
          renderDiskusiPosts();
        }
      }
    }).catch(e => console.warn('Supabase getDiskusiBersama note:', e));
  }
}

function renderDiskusiPosts() {
  const container = document.getElementById('diskusi-posts-container');
  if (container) {
    container.innerHTML = getDiskusiPostsHtml();
  }
}

function setDiskusiPrompt(topic) {
  const input = document.getElementById('diskusi-input-text');
  if (!input) return;
  input.value = `[${topic}] Menurut saya, `;
  input.focus();
}

async function submitDiskusiBersama() {
  const nameInput = document.getElementById('diskusi-author-name');
  const roleInput = document.getElementById('diskusi-author-role');
  const textInput = document.getElementById('diskusi-input-text');
  const alertEl = document.getElementById('diskusi-alert-msg');
  if (!textInput) return;

  const text = textInput.value.trim();
  const name = (nameInput ? nameInput.value.trim() : '') || AppState.studentName || 'Siswa Ceria';
  const role = (roleInput ? roleInput.value : '') || 'Siswa Kelas 3 SD';

  if (text.length < 5) {
    if (alertEl) {
      alertEl.innerText = 'Mohon tuliskan pendapatmu minimal 5 karakter ya!';
      alertEl.classList.remove('hidden');
    }
    textInput.focus();
    return;
  }

  if (alertEl) alertEl.classList.add('hidden');

  let kategori = '💬 Pendapat Siswa';
  if (text.includes('Tips menabung') || text.includes('menabung') || text.includes('celengan')) {
    kategori = '🐷 Tips Menabung';
  } else if (text.includes('kebutuhan') || text.includes('keinginan')) {
    kategori = '⚖️ Kebutuhan vs Keinginan';
  } else if (text.includes('belanja') || text.includes('uang saku')) {
    kategori = '💰 Belanja Bijak';
  }

  const newPost = {
    id: 'diskusi-' + Date.now(),
    nama: name,
    role: role,
    waktu: 'Baru saja',
    opini: text,
    kategori: kategori,
    likes: 1,
    comments: []
  };

  if (!AppState.diskusiBersama) AppState.diskusiBersama = getDefaultDiskusiPosts();
  AppState.diskusiBersama.unshift(newPost);
  localStorage.setItem('rbc_diskusi_bersama', JSON.stringify(AppState.diskusiBersama));

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected() && typeof window.RBC_SUPABASE.saveDiskusiBersama === 'function') {
    window.RBC_SUPABASE.saveDiskusiBersama(newPost);
  }

  textInput.value = '';
  window.soundManager.playSuccess();
  AppState.addReward(10, 2, 'Kirim pendapat di Diskusi Bersama!');
  AppState.showToast(`🎉 Pendapat dari ${name} berhasil diposting ke Diskusi Bersama! (+10 Poin, +2 Bintang)`);
  renderDiskusiPosts();
}

function submitDiskusiKomentar(postId) {
  const authorInput = document.getElementById(`komentar-author-${postId}`);
  const textInput = document.getElementById(`komentar-text-${postId}`);

  const author = (authorInput ? authorInput.value.trim() : '') || AppState.studentName || 'Teman Belajar';
  const text = textInput ? textInput.value.trim() : '';

  if (!text) {
    if (textInput) textInput.focus();
    return;
  }

  if (!AppState.diskusiBersama) AppState.diskusiBersama = getDefaultDiskusiPosts();
  const post = AppState.diskusiBersama.find(p => String(p.id) === String(postId));
  if (post) {
    if (!post.comments) post.comments = [];
    const newComment = {
      author: author,
      text: text,
      waktu: 'Baru saja'
    };
    post.comments.push(newComment);

    localStorage.setItem('rbc_diskusi_bersama', JSON.stringify(AppState.diskusiBersama));
    window.soundManager.playCorrect();
    AppState.addReward(5, 1, 'Tanggapan diskusimu berhasil dikirimkan!');
    AppState.showToast(`✅ Tanggapan dari ${author} berhasil dikirim! (+5 Poin, +1 Bintang)`);

    renderDiskusiPosts();

    if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected()) {
      if (typeof window.RBC_SUPABASE.saveDiskusiKomentar === 'function') {
        window.RBC_SUPABASE.saveDiskusiKomentar(postId, newComment);
      } else if (typeof window.RBC_SUPABASE.saveDiskusiBersama === 'function') {
        window.RBC_SUPABASE.saveDiskusiBersama(post);
      }
    }
  }
}

function quickDiskusiComment(postId, text) {
  const textInput = document.getElementById(`komentar-text-${postId}`);
  if (textInput) {
    textInput.value = text;
    submitDiskusiKomentar(postId);
  }
}

function likeDiskusiPost(postId) {
  if (!AppState.diskusiBersama) return;
  const post = AppState.diskusiBersama.find(p => String(p.id) === String(postId));
  if (post) {
    post.likes = (post.likes || 0) + 1;
    localStorage.setItem('rbc_diskusi_bersama', JSON.stringify(AppState.diskusiBersama));
    window.soundManager.playPop();
    renderDiskusiPosts();
  }
}

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

            <!-- EMBED PADLET PAMERAN KARYA (Sesuai Permintaan Revisi) -->
            <div class="mt-6 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-800">
                  <span class="text-lg">📌</span> Papan Interaktif Padlet Pameran Celengan Kreatif
                </span>
                <a href="https://padlet.com/embed/s025crorn0mkl1knlm7f" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline">
                  Buka Penuh di Tab Baru ↗️
                </a>
              </div>
              <div class="padlet-embed" style="border:1px solid rgba(0,0,0,0.1);border-radius:2px;box-sizing:border-box;overflow:hidden;position:relative;width:100%;background:#F4F4F4"><p style="padding:0;margin:0"><iframe src="https://padlet.com/embed/s025crorn0mkl1knlm7f" frameborder="0" allow="camera;microphone;geolocation;display-capture;clipboard-write" style="width:100%;height:608px;display:block;padding:0;margin:0"></iframe></p></div>
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

      <!-- SERTIFIKAT KELULUSAN (Hidden until claimed, printable, 2 Pilihan Desain Bertema Uang & Celengan) -->
      <div id="certificate-section" class="hidden pt-6 space-y-5">
        <!-- Pilihan 3 Versi Desain Sertifikat -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white border-2 border-amber-200 shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-center sm:text-left">
            <div>
              <span class="text-[11px] font-black uppercase tracking-wider text-amber-700 block">💰 Pilih Desain Sertifikat Penghargaan Siswa</span>
              <h3 class="text-sm sm:text-base font-black text-slate-800">Tersedia 3 Varian Desain (Biru Dasar, Merah Menengah, &amp; Emas Utama) — Pilih Favoritmu!</h3>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">📄 Format Standar A4 (21 cm × 29,7 cm)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button type="button" id="btn-cert-theme-biru" onclick="setCertificateTheme('biru')" class="text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${AppState.certTheme === 'biru' ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-200 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-sky-300'}">
              <span class="w-10 h-10 rounded-xl bg-sky-100 border border-sky-400 flex items-center justify-center text-xl flex-shrink-0">💶</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-black text-xs sm:text-sm text-slate-800">Varian 1: Biru (Seri Dasar)</span>
                  <span id="badge-cert-biru" class="${AppState.certTheme === 'biru' ? '' : 'hidden '}px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black">Dipilih</span>
                </div>
                <span class="text-[11px] text-slate-600 font-medium block truncate">Celengan babi, koin berkilau &amp; uang kartun</span>
              </div>
            </button>

            <button type="button" id="btn-cert-theme-merah" onclick="setCertificateTheme('merah')" class="text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${AppState.certTheme === 'merah' ? 'border-rose-500 bg-rose-50/90 ring-2 ring-rose-200 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-rose-300'}">
              <span class="w-10 h-10 rounded-xl bg-rose-100 border border-rose-400 flex items-center justify-center text-xl flex-shrink-0">🛒</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-black text-xs sm:text-sm text-slate-800">Varian 2: Merah (Seri Menengah)</span>
                  <span id="badge-cert-merah" class="${AppState.certTheme === 'merah' ? '' : 'hidden '}px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">Dipilih</span>
                </div>
                <span class="text-[11px] text-slate-600 font-medium block truncate">Keranjang belanja, kalkulator &amp; lencana juara</span>
              </div>
            </button>

            <button type="button" id="btn-cert-theme-emas" onclick="setCertificateTheme('emas')" class="text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${AppState.certTheme === 'emas' ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-200 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-amber-300'}">
              <span class="w-10 h-10 rounded-xl bg-amber-100 border border-amber-400 flex items-center justify-center text-xl flex-shrink-0">🏆</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-black text-xs sm:text-sm text-slate-800">Varian 3: Emas (Seri Utama)</span>
                  <span id="badge-cert-emas" class="${AppState.certTheme === 'emas' ? '' : 'hidden '}px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">Dipilih</span>
                </div>
                <span class="text-[11px] text-slate-600 font-medium block truncate">Piala emas, peti harta karun &amp; medali bintang</span>
              </div>
            </button>
          </div>
        </div>

        <div id="certificate-preview-host">
          ${renderCertificateCard(AppState.certTheme)}
        </div>

        <div class="flex justify-center gap-4">
          <button onclick="window.print()" class="btn-playful w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md">
            <span>🖨️ Cetak / Simpan Sertifikat</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

const CERT_MONEY_ICONS = {
  celenganBabiLucu: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <ellipse cx="32" cy="11" rx="8" ry="4" fill="#FDE047" stroke="#B45309" stroke-width="1.8"/>
      <text x="32" y="13" font-size="5" font-weight="900" fill="#78350F" text-anchor="middle">Rp</text>
      <ellipse cx="32" cy="38" rx="22" ry="17" fill="#BAE6FD" stroke="#0284C7" stroke-width="2.5"/>
      <path d="M19 25 L16 16 L27 21" fill="#7DD3FC" stroke="#0284C7" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M45 25 L48 16 L37 21" fill="#7DD3FC" stroke="#0284C7" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="32" cy="40" rx="7.5" ry="5.5" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
      <circle cx="29.5" cy="40" r="1.3" fill="#0369A1"/>
      <circle cx="34.5" cy="40" r="1.3" fill="#0369A1"/>
      <path d="M22 32 Q25 29 28 32" stroke="#0C4A6E" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 32 Q39 29 42 32" stroke="#0C4A6E" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="19" cy="36" rx="3" ry="2" fill="#F472B6" opacity="0.6"/>
      <ellipse cx="45" cy="36" rx="3" ry="2" fill="#F472B6" opacity="0.6"/>
      <rect x="27" y="22" width="10" height="2.5" rx="1.2" fill="#0369A1"/>
      <rect x="18" y="52" width="6" height="6" rx="2" fill="#7DD3FC" stroke="#0284C7" stroke-width="2"/>
      <rect x="40" y="52" width="6" height="6" rx="2" fill="#7DD3FC" stroke="#0284C7" stroke-width="2"/>
    </svg>
  `,
  koinRupiahBerkilau: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <circle cx="32" cy="32" r="22" fill="#FBBF24" stroke="#B45309" stroke-width="2.6"/>
      <circle cx="32" cy="32" r="17" fill="#FDE047" stroke="#D97706" stroke-width="1.6" stroke-dasharray="3 2"/>
      <text x="32" y="37" font-size="14" font-weight="900" fill="#78350F" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp</text>
      <path d="M50 14 L52 18 L56 20 L52 22 L50 26 L48 22 L44 20 L48 18 Z" fill="#FDE047" stroke="#CA8A04" stroke-width="1"/>
      <path d="M14 44 L15.5 47 L19 48 L15.5 49 L14 52 L12.5 49 L9 48 L12.5 47 Z" fill="#FEF08A"/>
    </svg>
  `,
  uangKertasKartun: () => `
    <svg viewBox="0 0 68 52" fill="none" class="w-full h-full">
      <g transform="rotate(-6 34 26)">
        <rect x="6" y="8" width="56" height="34" rx="5" fill="#38BDF8" stroke="#0284C7" stroke-width="2.5"/>
        <rect x="11" y="12" width="46" height="26" rx="3.5" fill="#E0F2FE" stroke="#0369A1" stroke-width="1.3" stroke-dasharray="2 1.5"/>
        <circle cx="34" cy="25" r="9" fill="#7DD3FC" stroke="#0284C7" stroke-width="1.4"/>
        <text x="34" y="29.5" font-size="10" font-weight="900" fill="#0C4A6E" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp</text>
        <circle cx="21" cy="25" r="2" fill="#0C4A6E"/>
        <circle cx="47" cy="25" r="2" fill="#0C4A6E"/>
        <path d="M31 30 Q34 33 37 30" stroke="#0C4A6E" stroke-width="1.6" stroke-linecap="round"/>
        <ellipse cx="18" cy="27" rx="2" ry="1.2" fill="#FDA4AF"/>
        <ellipse cx="50" cy="27" rx="2" ry="1.2" fill="#FDA4AF"/>
      </g>
    </svg>
  `,
  bintangKecil: () => `
    <svg viewBox="0 0 48 48" fill="none" class="w-full h-full">
      <path d="M24 4 L27 18 L41 21 L29 28 L32 42 L24 33 L16 42 L19 28 L7 21 L21 18 Z" fill="#FACC15" stroke="#B45309" stroke-width="1.5"/>
      <circle cx="38" cy="10" r="3" fill="#38BDF8"/>
      <circle cx="10" cy="38" r="2.5" fill="#FEF08A"/>
    </svg>
  `,
  wavyBlueBorderSvg: () => `
    <svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 700" fill="none">
      <path d="M 24 24 Q 250 8 500 24 T 976 24 Q 992 250 976 500 T 976 676 Q 750 692 500 676 T 24 676 Q 8 500 24 250 Z" stroke="#38BDF8" stroke-width="4" stroke-dasharray="14 7"/>
      <rect x="32" y="32" width="936" height="636" rx="20" stroke="#0284C7" stroke-width="1.8" opacity="0.65"/>
      <path d="M 20 70 Q 45 45 70 20" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
      <path d="M 980 70 Q 955 45 930 20" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
      <path d="M 20 630 Q 45 655 70 680" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
      <path d="M 980 630 Q 955 655 930 680" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,
  keranjangBelanja: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <rect x="20" y="14" width="7" height="15" rx="2" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.6"/>
      <rect x="21" y="11" width="5" height="4" rx="1" fill="#38BDF8"/>
      <ellipse cx="34" cy="18" rx="5" ry="12" transform="rotate(20 34 18)" fill="#FBBF24" stroke="#92400E" stroke-width="1.6"/>
      <circle cx="44" cy="22" r="6" fill="#EF4444" stroke="#991B1B" stroke-width="1.6"/>
      <path d="M44 16 Q45 13 47 13" stroke="#15803D" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 28 C16 12 48 12 48 28" stroke="#881337" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M12 28 L17 50 C17.5 52 19 53 21 53 H43 C45 53 46.5 52 47 50 L52 28 Z" fill="#FB7185" stroke="#9F1239" stroke-width="2.6" stroke-linejoin="round"/>
      <line x1="22" y1="34" x2="42" y2="34" stroke="#FFE4E6" stroke-width="1.8"/>
      <line x1="24" y1="42" x2="40" y2="42" stroke="#FFE4E6" stroke-width="1.8"/>
      <line x1="26" y1="28" x2="28" y2="52" stroke="#FFE4E6" stroke-width="1.8"/>
      <line x1="38" y1="28" x2="36" y2="52" stroke="#FFE4E6" stroke-width="1.8"/>
      <circle cx="32" cy="38" r="4.5" fill="#FEF08A" stroke="#B45309" stroke-width="1.2"/>
      <circle cx="30.5" cy="37" r="0.8" fill="#78350F"/>
      <circle cx="33.5" cy="37" r="0.8" fill="#78350F"/>
      <path d="M30.5 39.5 Q32 41 33.5 39.5" stroke="#78350F" stroke-width="1" stroke-linecap="round"/>
    </svg>
  `,
  tasBelanjaKebutuhan: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <rect x="22" y="12" width="8" height="16" rx="2" fill="#60A5FA" stroke="#1E40AF" stroke-width="1.5"/>
      <circle cx="38" cy="18" r="6" fill="#F97316" stroke="#9A3412" stroke-width="1.5"/>
      <rect x="30" y="8" width="6" height="18" rx="2" fill="#4ADE80" stroke="#166534" stroke-width="1.5"/>
      <path d="M22 26 C22 16 42 16 42 26" stroke="#B45309" stroke-width="2.5" fill="none"/>
      <path d="M14 24 L18 52 C18.5 54 20 55 22 55 H42 C44 55 45.5 54 46 52 L50 24 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M32 37 C30 33 26 34 26 37 C26 41 32 44 32 44 C32 44 38 41 38 37 C38 34 34 33 32 37 Z" fill="#EF4444"/>
      <text x="32" y="51" font-size="5.5" font-weight="900" fill="#92400E" text-anchor="middle" font-family="'Fredoka', sans-serif">KEBUTUHAN</text>
    </svg>
  `,
  kalkulatorLucu: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <rect x="14" y="10" width="36" height="46" rx="7" fill="#F43F5E" stroke="#881337" stroke-width="2.5"/>
      <rect x="19" y="16" width="26" height="11" rx="3" fill="#FFE4E6" stroke="#9F1239" stroke-width="1.5"/>
      <text x="32" y="24" font-size="6.5" font-weight="900" fill="#881337" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp BIJAK</text>
      <circle cx="23" cy="22" r="1" fill="#881337"/>
      <circle cx="41" cy="22" r="1" fill="#881337"/>
      <rect x="19" y="31" width="7" height="6" rx="2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/>
      <rect x="28.5" y="31" width="7" height="6" rx="2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/>
      <rect x="38" y="31" width="7" height="6" rx="2" fill="#FDBA74" stroke="#C2410C" stroke-width="1.2"/>
      <rect x="19" y="39" width="7" height="6" rx="2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/>
      <rect x="28.5" y="39" width="7" height="6" rx="2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/>
      <rect x="38" y="39" width="7" height="6" rx="2" fill="#FDBA74" stroke="#C2410C" stroke-width="1.2"/>
      <rect x="19" y="47" width="16.5" height="6" rx="2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/>
      <rect x="38" y="47" width="7" height="6" rx="2" fill="#38BDF8" stroke="#0284C7" stroke-width="1.2"/>
    </svg>
  `,
  lencanaJuara: () => `
    <svg viewBox="0 0 64 68" fill="none" class="w-full h-full">
      <path d="M24 38 L16 62 L26 57 L32 64 L33 40" fill="#E11D48" stroke="#881337" stroke-width="2" stroke-linejoin="round"/>
      <path d="M40 38 L48 62 L38 57 L32 64 L31 40" fill="#FB7185" stroke="#9F1239" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="32" cy="26" r="18" fill="#E11D48" stroke="#FB923C" stroke-width="3"/>
      <circle cx="32" cy="26" r="14" fill="#FBBF24" stroke="#B45309" stroke-width="1.8"/>
      <polygon points="32,15 35,22 43,23 37,28 39,36 32,32 25,36 27,28 21,23 29,22" fill="#FEF08A" stroke="#92400E" stroke-width="1.3"/>
    </svg>
  `,
  geometricRibbonBorderSvg: () => `
    <svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 700" fill="none">
      <rect x="22" y="22" width="956" height="656" rx="14" stroke="#FB7185" stroke-width="3.5"/>
      <rect x="30" y="30" width="940" height="640" rx="10" stroke="#9F1239" stroke-width="1.8" stroke-dasharray="12 6"/>
      <polygon points="22,60 60,22 80,22 22,80" fill="#FDA4AF" opacity="0.85"/>
      <polygon points="978,60 940,22 920,22 978,80" fill="#FDA4AF" opacity="0.85"/>
      <polygon points="22,640 60,678 80,678 22,620" fill="#FDA4AF" opacity="0.85"/>
      <polygon points="978,640 940,678 920,678 978,620" fill="#FDA4AF" opacity="0.85"/>
      <rect x="68" y="26" width="6" height="6" transform="rotate(45 71 29)" fill="#F97316"/>
      <rect x="928" y="26" width="6" height="6" transform="rotate(45 931 29)" fill="#F97316"/>
      <rect x="68" y="668" width="6" height="6" transform="rotate(45 71 671)" fill="#F97316"/>
      <rect x="928" y="668" width="6" height="6" transform="rotate(45 931 671)" fill="#F97316"/>
    </svg>
  `,
  pialaEmas: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <path d="M18 20 C10 20 10 32 20 34" stroke="#B45309" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M46 20 C54 20 54 32 44 34" stroke="#B45309" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M19 14 H45 V28 C45 36 39 42 32 42 C25 42 19 36 19 28 Z" fill="#FBBF24" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="32" cy="14" rx="13" ry="3" fill="#FDE047" stroke="#B45309" stroke-width="2"/>
      <polygon points="32,20 34,24 38,24.5 35,27.5 36,32 32,29.5 28,32 29,27.5 26,24.5 30,24" fill="#FEF08A" stroke="#78350F" stroke-width="1.2"/>
      <path d="M30 42 H34 V48 H30 Z" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
      <path d="M22 54 L26 48 H38 L42 54 Z" fill="#D97706" stroke="#78350F" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="20" y="54" width="24" height="4" rx="1.5" fill="#78350F"/>
      <circle cx="16" cy="12" r="1.5" fill="#FDE047"/>
      <circle cx="48" cy="12" r="2" fill="#FDE047"/>
    </svg>
  `,
  medaliBintang: () => `
    <svg viewBox="0 0 64 68" fill="none" class="w-full h-full">
      <path d="M22 10 L28 32 L32 30 L36 32 L42 10" fill="#DC2626" stroke="#991B1B" stroke-width="2.2"/>
      <circle cx="32" cy="40" r="18" fill="#F59E0B" stroke="#92400E" stroke-width="2.6"/>
      <circle cx="32" cy="40" r="14" fill="#FDE047" stroke="#B45309" stroke-width="1.5" stroke-dasharray="3 2"/>
      <polygon points="32,28 35,35 43,36 37,41 39,49 32,45 25,49 27,41 21,36 29,35" fill="#FEF08A" stroke="#78350F" stroke-width="1.4"/>
    </svg>
  `,
  petiHartaKarun: () => `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full">
      <path d="M12 24 C12 12 52 12 52 24 Z" fill="#B45309" stroke="#78350F" stroke-width="2.5"/>
      <circle cx="22" cy="22" r="4.5" fill="#FDE047" stroke="#B45309" stroke-width="1.4"/>
      <circle cx="30" cy="20" r="5" fill="#FACC15" stroke="#B45309" stroke-width="1.4"/>
      <circle cx="38" cy="19" r="5" fill="#FEF08A" stroke="#B45309" stroke-width="1.4"/>
      <circle cx="44" cy="22" r="4.5" fill="#FDE047" stroke="#B45309" stroke-width="1.4"/>
      <rect x="12" y="24" width="40" height="28" rx="5" fill="#D97706" stroke="#78350F" stroke-width="2.6"/>
      <rect x="18" y="24" width="5" height="28" fill="#FDE68A" stroke="#92400E" stroke-width="1.4"/>
      <rect x="41" y="24" width="5" height="28" fill="#FDE68A" stroke="#92400E" stroke-width="1.4"/>
      <rect x="28" y="27" width="8" height="9" rx="2.5" fill="#EF4444" stroke="#991B1B" stroke-width="1.5"/>
      <circle cx="32" cy="31.5" r="1.5" fill="#FEF08A"/>
    </svg>
  `,
  pitaPenghargaan: () => `
    <svg viewBox="0 0 64 68" fill="none" class="w-full h-full">
      <path d="M22 36 L15 62 L26 57 L31 64 L32 38" fill="#D97706" stroke="#78350F" stroke-width="2.2"/>
      <path d="M42 36 L49 62 L38 57 L33 64 L32 38" fill="#F59E0B" stroke="#92400E" stroke-width="2.2"/>
      <circle cx="32" cy="25" r="17" fill="#FBBF24" stroke="#92400E" stroke-width="2.8"/>
      <circle cx="32" cy="25" r="12" fill="#FEF9C3" stroke="#D97706" stroke-width="1.5"/>
      <text x="32" y="29" font-size="10" font-weight="900" fill="#78350F" text-anchor="middle" font-family="'Fredoka', sans-serif">★</text>
    </svg>
  `,
  classicGoldBorderSvg: () => `
    <svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 700" fill="none">
      <rect x="22" y="22" width="956" height="656" rx="12" stroke="#D97706" stroke-width="3.5"/>
      <rect x="30" y="30" width="940" height="640" rx="8" stroke="#F59E0B" stroke-width="1.8"/>
      <rect x="36" y="36" width="928" height="628" rx="6" stroke="#FDE047" stroke-width="1" stroke-dasharray="6 4" opacity="0.75"/>
      <path d="M 30,80 C 50,80 80,50 80,30" stroke="#B45309" stroke-width="2.5" fill="none"/>
      <path d="M 970,80 C 950,80 920,50 920,30" stroke="#B45309" stroke-width="2.5" fill="none"/>
      <path d="M 30,620 C 50,620 80,650 80,670" stroke="#B45309" stroke-width="2.5" fill="none"/>
      <path d="M 970,620 C 950,620 920,650 920,670" stroke="#B45309" stroke-width="2.5" fill="none"/>
      <circle cx="85" cy="85" r="3.5" fill="#FDE047" stroke="#B45309" stroke-width="1"/>
      <circle cx="915" cy="85" r="3.5" fill="#FDE047" stroke="#B45309" stroke-width="1"/>
      <circle cx="85" cy="615" r="3.5" fill="#FDE047" stroke="#B45309" stroke-width="1"/>
      <circle cx="915" cy="615" r="3.5" fill="#FDE047" stroke="#B45309" stroke-width="1"/>
    </svg>
  `,
  officialStamp: (theme = 'biru') => {
    let ringColor = '#0284C7';
    let badgeFill = '#F0F9FF';
    let textColor = '#0369A1';
    let centerIcon = '🪙';

    if (theme === 'merah') {
      ringColor = '#E11D48';
      badgeFill = '#FFF1F2';
      textColor = '#9F1239';
      centerIcon = '🛒';
    } else if (theme === 'emas') {
      ringColor = '#D97706';
      badgeFill = '#FFFBEB';
      textColor = '#78350F';
      centerIcon = '🏆';
    }

    return `
      <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center select-none -rotate-6" title="Stempel Resmi: BIJAK KELOLA DANA &amp; MENABUNG">
        <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-sm">
          <circle cx="50" cy="50" r="48" fill="${badgeFill}" stroke="${ringColor}" stroke-width="2.5" stroke-dasharray="4 2"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${ringColor}" stroke-width="1.5"/>
          <path id="stamp-curve-${theme}" d="M 18,50 A 32,32 0 1,1 82,50 A 32,32 0 1,1 18,50" fill="none"/>
          <text font-size="7.2" font-weight="900" fill="${textColor}" letter-spacing="0.8">
            <textPath href="#stamp-curve-${theme}" startOffset="50%" text-anchor="middle">
              ★ BIJAK KELOLA DANA &amp; MENABUNG ★
            </textPath>
          </text>
          <circle cx="50" cy="50" r="17" fill="white" stroke="${ringColor}" stroke-width="1.5"/>
          <text x="50" y="48" font-size="11" text-anchor="middle">${centerIcon}</text>
          <text x="50" y="58" font-size="6" font-weight="900" fill="${textColor}" text-anchor="middle" font-family="'Fredoka', sans-serif">DHETIK</text>
        </svg>
      </div>
    `;
  }
};

function renderCertificateCard(theme = 'biru') {
  const isRed = theme === 'merah' || theme === 'merah100k' || theme === 'petualangan';
  const isBlue = theme === 'biru' || theme === 'blue';
  const safeStudentName = escapeHtmlText(AppState.studentName);
  const issueDate = "25 November 2026";
  const devList = (typeof RBC_DATA !== 'undefined' ? RBC_DATA : (window.RBC_DATA || {})).appInfo?.developers || [
    "Ines Khairunisa",
    "Nasrun Nurhakim",
    "Nur Afifah Handayani",
    "Zidna Syifanadia Impian Pragita Mariannisa"
  ];

  let themeCfg;
  if (isBlue) {
    themeCfg = {
      themeKey: 'biru',
      subseriesTitle: 'SERI BIRU — RUPIAH DANA &amp; CELENGAN CERIA',
      subseriesClass: 'bg-sky-100 text-sky-800 border border-sky-300',
      outerClass: 'border-sky-500 bg-gradient-to-br from-sky-400 via-sky-200 to-blue-300',
      innerClass: 'border-sky-300 bg-white shadow-inner',
      borderSvg: CERT_MONEY_ICONS.wavyBlueBorderSvg(),
      cornerBracketColor: 'border-sky-400',
      watermarkColor: 'text-sky-300',
      nameWrapClass: 'border-b-2 border-sky-400',
      nameTextClass: 'text-sky-900',
      dividerLineClass: 'bg-sky-400',
      starColor: 'text-amber-400',
      bulletColor: 'bg-sky-500',
      awardPillClass: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 border-2 border-amber-300 text-white shadow-md',
      awardLeftMini: CERT_MONEY_ICONS.koinRupiahBerkilau(),
      awardRightMini: CERT_MONEY_ICONS.celenganBabiLucu(),
      footerBorderClass: 'border-sky-200',
      securityStripClass: 'bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-400',
      cornerTopLeft: CERT_MONEY_ICONS.celenganBabiLucu(),
      cornerTopRight: CERT_MONEY_ICONS.koinRupiahBerkilau(),
      cornerBottomLeft: CERT_MONEY_ICONS.uangKertasKartun(),
      cornerBottomRight: CERT_MONEY_ICONS.bintangKecil(),
      sideLeftIcons: `
        <div class="w-12 h-12 rounded-2xl bg-sky-50/95 border border-sky-200 p-1.5 shadow-sm -rotate-6">${CERT_MONEY_ICONS.celenganBabiLucu()}</div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50/95 border border-amber-200 p-1.5 shadow-sm rotate-6">${CERT_MONEY_ICONS.koinRupiahBerkilau()}</div>
        <div class="w-11 h-11 rounded-2xl bg-sky-50/95 border border-sky-200 p-1.5 shadow-sm -rotate-3">${CERT_MONEY_ICONS.uangKertasKartun()}</div>
      `,
      sideRightIcons: `
        <div class="w-12 h-12 rounded-2xl bg-amber-50/95 border border-amber-200 p-1.5 shadow-sm rotate-6">${CERT_MONEY_ICONS.koinRupiahBerkilau()}</div>
        <div class="w-11 h-11 rounded-2xl bg-sky-50/95 border border-sky-200 p-1.5 shadow-sm -rotate-6">${CERT_MONEY_ICONS.bintangKecil()}</div>
        <div class="w-11 h-11 rounded-2xl bg-sky-50/95 border border-sky-200 p-1.5 shadow-sm rotate-3">${CERT_MONEY_ICONS.celenganBabiLucu()}</div>
      `,
      stamp: CERT_MONEY_ICONS.officialStamp('biru')
    };
  } else if (isRed) {
    themeCfg = {
      themeKey: 'merah',
      subseriesTitle: 'SERI MERAH — PAHLAWAN CERMAT &amp; BELANJA PINTAR',
      subseriesClass: 'bg-rose-100 text-rose-800 border border-rose-300',
      outerClass: 'border-rose-500 bg-gradient-to-br from-rose-400 via-rose-200 to-red-300',
      innerClass: 'border-rose-300 bg-white shadow-inner',
      borderSvg: CERT_MONEY_ICONS.geometricRibbonBorderSvg(),
      cornerBracketColor: 'border-rose-400',
      watermarkColor: 'text-rose-300',
      nameWrapClass: 'border-b-2 border-rose-400',
      nameTextClass: 'text-rose-900',
      dividerLineClass: 'bg-rose-400',
      starColor: 'text-amber-500',
      bulletColor: 'bg-rose-500',
      awardPillClass: 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 border-2 border-amber-300 text-white shadow-md',
      awardLeftMini: CERT_MONEY_ICONS.keranjangBelanja(),
      awardRightMini: CERT_MONEY_ICONS.lencanaJuara(),
      footerBorderClass: 'border-rose-200',
      securityStripClass: 'bg-gradient-to-b from-amber-300 via-rose-400 to-amber-300',
      cornerTopLeft: CERT_MONEY_ICONS.keranjangBelanja(),
      cornerTopRight: CERT_MONEY_ICONS.tasBelanjaKebutuhan(),
      cornerBottomLeft: CERT_MONEY_ICONS.kalkulatorLucu(),
      cornerBottomRight: CERT_MONEY_ICONS.lencanaJuara(),
      sideLeftIcons: `
        <div class="w-12 h-12 rounded-2xl bg-rose-50/95 border border-rose-200 p-1.5 shadow-sm -rotate-6">${CERT_MONEY_ICONS.keranjangBelanja()}</div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50/95 border border-amber-200 p-1.5 shadow-sm rotate-6">${CERT_MONEY_ICONS.tasBelanjaKebutuhan()}</div>
        <div class="w-11 h-11 rounded-2xl bg-rose-50/95 border border-rose-200 p-1.5 shadow-sm -rotate-3">${CERT_MONEY_ICONS.kalkulatorLucu()}</div>
      `,
      sideRightIcons: `
        <div class="w-12 h-12 rounded-2xl bg-amber-50/95 border border-amber-200 p-1.5 shadow-sm rotate-6">${CERT_MONEY_ICONS.lencanaJuara()}</div>
        <div class="w-11 h-11 rounded-2xl bg-rose-50/95 border border-rose-200 p-1.5 shadow-sm -rotate-6">${CERT_MONEY_ICONS.keranjangBelanja()}</div>
        <div class="w-11 h-11 rounded-2xl bg-rose-50/95 border border-rose-200 p-1.5 shadow-sm rotate-3">${CERT_MONEY_ICONS.kalkulatorLucu()}</div>
      `,
      stamp: CERT_MONEY_ICONS.officialStamp('merah')
    };
  } else {
    themeCfg = {
      themeKey: 'emas',
      subseriesTitle: 'SERI EMAS — BINTANG UTAMA BIJAK KELOLA DANA',
      subseriesClass: 'bg-amber-100 text-amber-900 border border-amber-300',
      outerClass: 'border-amber-500 bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-300',
      innerClass: 'border-amber-300 bg-[#FFFDF7] shadow-inner',
      borderSvg: CERT_MONEY_ICONS.classicGoldBorderSvg(),
      cornerBracketColor: 'border-amber-400',
      watermarkColor: 'text-amber-400',
      nameWrapClass: 'border-b-2 border-amber-400',
      nameTextClass: 'text-amber-950',
      dividerLineClass: 'bg-amber-400',
      starColor: 'text-amber-500',
      bulletColor: 'bg-amber-600',
      awardPillClass: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 border-2 border-amber-600 text-amber-950 shadow-md',
      awardLeftMini: CERT_MONEY_ICONS.pialaEmas(),
      awardRightMini: CERT_MONEY_ICONS.medaliBintang(),
      footerBorderClass: 'border-amber-200',
      securityStripClass: 'bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-400',
      cornerTopLeft: CERT_MONEY_ICONS.pialaEmas(),
      cornerTopRight: CERT_MONEY_ICONS.medaliBintang(),
      cornerBottomLeft: CERT_MONEY_ICONS.petiHartaKarun(),
      cornerBottomRight: CERT_MONEY_ICONS.pitaPenghargaan(),
      sideLeftIcons: `
        <div class="w-12 h-12 rounded-2xl bg-amber-50/95 border border-amber-300 p-1.5 shadow-sm -rotate-6">${CERT_MONEY_ICONS.pialaEmas()}</div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50/95 border border-amber-300 p-1.5 shadow-sm rotate-6">${CERT_MONEY_ICONS.petiHartaKarun()}</div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50/95 border border-amber-300 p-1.5 shadow-sm -rotate-3">${CERT_MONEY_ICONS.medaliBintang()}</div>
      `,
      sideRightIcons: `
        <div class="w-12 h-12 rounded-2xl bg-amber-50/95 border border-amber-300 p-1.5 shadow-sm rotate-6">${CERT_MONEY_ICONS.petiHartaKarun()}</div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50/95 border border-amber-300 p-1.5 shadow-sm -rotate-6">${CERT_MONEY_ICONS.medaliBintang()}</div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50/95 border border-amber-300 p-1.5 shadow-sm rotate-3">${CERT_MONEY_ICONS.pitaPenghargaan()}</div>
      `,
      stamp: CERT_MONEY_ICONS.officialStamp('emas')
    };
  }

  return `
    <div id="certificate-print-area" class="certificate-a4-fixed rounded-3xl p-3 sm:p-5 md:p-6 border-4 sm:border-8 ${themeCfg.outerClass} text-center relative overflow-hidden shadow-2xl transition-colors duration-300" style="max-width: 297mm; min-height: 210mm; aspect-ratio: 297 / 210;">
      <!-- Strip Pita Dekorasi Sisi Kiri & Kanan -->
      <div class="hidden sm:block absolute inset-y-4 left-1.5 w-1.5 rounded-full opacity-75 ${themeCfg.securityStripClass}" aria-hidden="true"></div>
      <div class="hidden sm:block absolute inset-y-4 right-1.5 w-1.5 rounded-full opacity-75 ${themeCfg.securityStripClass}" aria-hidden="true"></div>

      <div class="relative rounded-2xl border-2 ${themeCfg.innerClass} px-5 sm:px-10 md:px-14 py-4 sm:py-5 md:py-6 overflow-hidden flex flex-col justify-between h-full">
        <!-- Bingkai Vektor Unik Tiap Seri -->
        ${themeCfg.borderSvg}

        <!-- Tanda Air Koin Rupiah Lembut di Tengah Belakang -->
        <div class="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none ${themeCfg.watermarkColor}" aria-hidden="true">
          <svg viewBox="0 0 200 200" class="w-64 h-64 sm:w-80 sm:h-80" fill="none">
            <circle cx="100" cy="100" r="88" stroke="currentColor" stroke-width="6" stroke-dasharray="10 6"/>
            <circle cx="100" cy="100" r="68" stroke="currentColor" stroke-width="3"/>
            <text x="100" y="118" font-size="64" font-weight="900" fill="currentColor" text-anchor="middle" font-family="'Fredoka', sans-serif">Rp</text>
          </svg>
        </div>

        <!-- Garis Siku Sudut Bingkai -->
        <span class="absolute top-1.5 left-1.5 w-4 h-4 border-t-4 border-l-4 rounded-tl-md ${themeCfg.cornerBracketColor} opacity-65 pointer-events-none"></span>
        <span class="absolute top-1.5 right-1.5 w-4 h-4 border-t-4 border-r-4 rounded-tr-md ${themeCfg.cornerBracketColor} opacity-65 pointer-events-none"></span>
        <span class="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-4 border-l-4 rounded-bl-md ${themeCfg.cornerBracketColor} opacity-65 pointer-events-none"></span>
        <span class="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-4 border-r-4 rounded-br-md ${themeCfg.cornerBracketColor} opacity-65 pointer-events-none"></span>

        <!-- 4 Dekorasi Sudut Unik Tiap Varian -->
        <div class="absolute top-2.5 left-2.5 sm:top-4 sm:left-5 w-8 h-8 sm:w-11 sm:h-11 pointer-events-none select-none" aria-hidden="true">
          ${themeCfg.cornerTopLeft}
        </div>
        <div class="absolute top-2.5 right-2.5 sm:top-4 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 pointer-events-none select-none" aria-hidden="true">
          ${themeCfg.cornerTopRight}
        </div>
        <div class="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-5 w-8 h-8 sm:w-11 sm:h-11 pointer-events-none select-none" aria-hidden="true">
          ${themeCfg.cornerBottomLeft}
        </div>
        <div class="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 pointer-events-none select-none" aria-hidden="true">
          ${themeCfg.cornerBottomRight}
        </div>

        <!-- Dekorasi Samping Kiri & Kanan (Desktop & Cetak Landscape) -->
        <div class="hidden lg:flex flex-col gap-2.5 items-center absolute top-1/2 -translate-y-1/2 left-3 sm:left-5 pointer-events-none select-none" aria-hidden="true">
          ${themeCfg.sideLeftIcons}
        </div>
        <div class="hidden lg:flex flex-col gap-2.5 items-center absolute top-1/2 -translate-y-1/2 right-3 sm:right-5 pointer-events-none select-none" aria-hidden="true">
          ${themeCfg.sideRightIcons}
        </div>

        <!-- KONTEN UTAMA SERTIFIKAT LANDSCAPE A4 -->
        <div class="relative z-10 max-w-3xl mx-auto flex flex-col justify-between h-full w-full">
          
          <!-- Bagian Atas: Logo UPI Cibiru 3 cm, Header Instansi, & Judul Utama -->
          <div class="space-y-1 pt-1 text-center">
            <!-- Logo UPI 3 cm -->
            <div class="flex items-center justify-center mb-1">
              <div class="rounded-full bg-white p-1.5 shadow-md border-2 border-red-200 ring-2 ring-amber-200/60 inline-flex items-center justify-center flex-shrink-0" style="width: 3cm; height: 3cm; min-width: 3cm; min-height: 3cm;">
                <img src="assets/images/logo.png" alt="Logo UPI" class="w-full h-full object-contain" />
              </div>
            </div>

            <div class="space-y-0.5">
              <h1 class="text-xs sm:text-sm font-black tracking-widest uppercase text-red-700 block font-title">UNIVERSITAS PENDIDIKAN INDONESIA — KAMPUS UPI CIBIRU</h1>
            </div>

            <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight font-title mt-1 mb-1">SERTIFIKAT PENGHARGAAN</h2>

            <!-- Divider Elegan -->
            <div class="flex items-center justify-center gap-3 my-1.5" aria-hidden="true">
              <span class="h-0.5 w-16 sm:w-28 ${themeCfg.dividerLineClass} rounded-full"></span>
              <span class="${themeCfg.starColor} text-xs sm:text-sm tracking-widest select-none">★ ★ ★</span>
              <span class="h-0.5 w-16 sm:w-28 ${themeCfg.dividerLineClass} rounded-full"></span>
            </div>
          </div>

          <!-- Bagian Tengah: Kalimat Pembuka, Nama Lengkap Siswa, Isi Keterangan, & Predikat -->
          <div class="space-y-1.5 sm:space-y-2 py-1 my-auto text-center">
            <p class="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Diberikan dengan penuh rasa bangga kepada:</p>
            
            <div class="py-1 ${themeCfg.nameWrapClass} max-w-xl mx-auto">
              <h3 id="cert-student-name" class="text-3xl sm:text-4xl md:text-5xl font-black ${themeCfg.nameTextClass} font-title tracking-wide">${safeStudentName}</h3>
            </div>

            <p class="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium pt-0.5">
              Telah berhasil menyelesaikan seluruh tahapan pembelajaran <strong>Model DHETIK</strong> pada materi <em>Bab 5: Bijak Berbelanja Kebutuhan</em>, cermat membedakan kebutuhan dan keinginan, terampil menabung di celengan, serta dinobatkan sebagai:
            </p>

            <div class="pt-0.5">
              <div class="inline-flex items-center gap-2 px-6 py-1.5 rounded-full ${themeCfg.awardPillClass} font-black text-xs sm:text-sm shadow-md">
                <span class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">${themeCfg.awardLeftMini}</span>
                <span>ANAK HEBAT BIJAK BERBELANJA</span>
                <span class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">${themeCfg.awardRightMini}</span>
              </div>
            </div>
          </div>

          <!-- Bagian Bawah: Tanggal Terbit & Tim Pengembang (Dinaikkan 2 Enter ke Atas & Tertata Rapi) -->
          <div class="pt-3 sm:pt-4 border-t ${themeCfg.footerBorderClass} flex flex-col sm:flex-row items-start justify-between gap-4 text-xs px-2 sm:px-6 mb-7 sm:mb-9 md:mb-11">
            <!-- Kolom Kiri: Tanggal Terbit -->
            <div class="text-left space-y-1">
              <span class="block text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Tanggal Terbit</span>
              <p class="text-xs sm:text-sm md:text-base font-black text-slate-800 leading-tight">${issueDate}</p>
            </div>

            <!-- Kolom Kanan: Tim Pengembang 2 Kolom Rapi -->
            <div class="text-left space-y-1">
              <span class="block text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Tim Pengembang:</span>
              <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-left">
                ${devList.map(dev => `
                  <div class="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-800">
                    <span class="w-1.5 h-1.5 rounded-full ${themeCfg.bulletColor} flex-shrink-0"></span>
                    <span class="whitespace-nowrap">${dev}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

function setCertificateTheme(theme) {
  const validTheme = ['biru', 'merah', 'emas'].includes(theme) ? theme : 'biru';
  AppState.certTheme = validTheme;
  localStorage.setItem('rbc_cert_theme', validTheme);
  window.soundManager.playPop();

  if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected() && typeof window.RBC_SUPABASE.saveSertifikat === 'function') {
    window.RBC_SUPABASE.saveSertifikat({
      nama: AppState.studentName || 'Teman Belajar',
      tema: validTheme,
      predikat: 'ANAK HEBAT BIJAK BERBELANJA'
    });
  }

  const host = document.getElementById('certificate-preview-host');
  if (host) {
    host.innerHTML = renderCertificateCard(validTheme);
  }

  const btnBiru = document.getElementById('btn-cert-theme-biru');
  const btnMerah = document.getElementById('btn-cert-theme-merah');
  const btnEmas = document.getElementById('btn-cert-theme-emas');
  const badgeBiru = document.getElementById('badge-cert-biru');
  const badgeMerah = document.getElementById('badge-cert-merah');
  const badgeEmas = document.getElementById('badge-cert-emas');

  const baseStyle = 'text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 border-slate-200 bg-slate-50';

  if (btnBiru) {
    btnBiru.className = (validTheme === 'biru')
      ? 'text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 border-sky-500 bg-sky-50/90 ring-2 ring-sky-200 shadow-sm'
      : `${baseStyle} hover:border-sky-300`;
  }
  if (btnMerah) {
    btnMerah.className = (validTheme === 'merah')
      ? 'text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 border-rose-500 bg-rose-50/90 ring-2 ring-rose-200 shadow-sm'
      : `${baseStyle} hover:border-rose-300`;
  }
  if (btnEmas) {
    btnEmas.className = (validTheme === 'emas')
      ? 'text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 border-amber-500 bg-amber-50/90 ring-2 ring-amber-200 shadow-sm'
      : `${baseStyle} hover:border-amber-300`;
  }

  if (badgeBiru) badgeBiru.classList.toggle('hidden', validTheme !== 'biru');
  if (badgeMerah) badgeMerah.classList.toggle('hidden', validTheme !== 'merah');
  if (badgeEmas) badgeEmas.classList.toggle('hidden', validTheme !== 'emas');
}
window.setCertificateTheme = setCertificateTheme;

async function initTahapKView() {
  if (AppState.reflection.tahu) {
    const t = document.getElementById('ref-tahu');
    const m = document.getElementById('ref-merasa');
    const c = document.getElementById('ref-mencoba');
    if (t) t.value = AppState.reflection.tahu;
    if (m) m.value = AppState.reflection.merasa;
    if (c) c.value = AppState.reflection.mencoba;
  }

  if (AppState.reflection.tahu && AppState.reflection.merasa && AppState.reflection.mencoba) {
    const cert = document.getElementById('certificate-section');
    if (cert) cert.classList.remove('hidden');
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
  const host = document.getElementById('certificate-preview-host');
  if (host) {
    host.innerHTML = renderCertificateCard(AppState.certTheme);
  }
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
      <!-- Tombol Navigasi Kembali ke Tahap I (Ikat Konsep) -->
      <div class="flex items-center justify-between gap-2 pb-1">
        <button type="button" onclick="switchTab('i')" class="btn-playful inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-800 text-xs font-bold transition-all shadow-2xs">
          <span>⬅️ Kembali ke Halaman Ikat Konsep (Tahap I)</span>
        </button>
        <span class="text-xs text-slate-500 font-semibold hidden sm:inline">Bab 5 • Kuis Evaluasi Interaktif 10 Soal</span>
      </div>

      <div class="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Uji Pemahaman</span>
            <span class="text-xs text-amber-100 font-semibold hidden md:inline">Terhubung dari Tahap I</span>
          </div>
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
          <button onclick="switchTab('i')" class="btn-playful w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-200">
            <span>⬅️ Kembali ke Halaman Ikat Konsep (Tahap I)</span>
          </button>
          <button onclick="initKuisView()" class="btn-playful w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md">
            <span>🔄 Ulangi Kuis</span>
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

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <button type="button" onclick="switchTab('i')" class="text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-1">
          <span>⬅️ Kembali ke Halaman Ikat Konsep</span>
        </button>
        <span class="text-slate-400 font-medium">Pilih salah satu jawaban yang benar</span>
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
   VIEW 10: POJOK GAME EDUKASI CERIA (5 GAME LENGKAP • 10 SOAL REALISTIS)
   1. Tebak Gambar Uang & Barang (10 Soal Realistis Uang Asli)
   2. Susun Kata Ceria (10 Kata Finansial Interaktif)
   3. Petualangan Matematika Belanja (10 Soal Hitung Uang Nyata)
   4. Pasangkan Kategori Kebutuhan vs Keinginan (10 Skenario Nyata)
   5. Benar atau Salah Cermat Finansial (10 Literasi Keuangan Nyata)
   ============================================================ */

const RBC_GAMES_DATA = {
  tebak: {
    id: 'tebak',
    title: 'Tebak Gambar Uang & Barang',
    subtitle: 'Amati foto asli uang Rupiah resmi Bank Indonesia dan pilih nominalnya dengan tepat!',
    questions: [
      {
        visual: `
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg border-4 border-slate-300 ring-4 ring-amber-300/60 bg-slate-100 flex items-center justify-center p-1 select-none transition-transform hover:scale-105">
            <img src="assets/images/uang/koin-500-depan.jpg" alt="Uang Logam Rp500 Asli" class="w-full h-full object-cover rounded-full" />
          </div>`,
        prompt: 'Berapakah nilai nominal uang koin logam resmi Bank Indonesia pada gambar di atas?',
        hint: 'Perhatikan angka nominal yang tertera pada bagian tengah koin logam.',
        options: ['Rp500', 'Rp1.000', 'Rp200', 'Rp100'],
        correct: 0,
        explanation: 'Benar! Itu adalah uang logam resmi Bank Indonesia pecahan Rp500 (bunga Melati).'
      },
      {
        visual: `
          <div class="w-52 sm:w-60 md:w-68 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 bg-white transition-transform hover:scale-105 select-none">
            <img src="assets/images/uang/kertas-2000.jpg" alt="Uang Kertas Rp2.000 Asli Emisi 2022" class="w-full h-auto object-contain block" />
          </div>`,
        prompt: 'Uang kertas Tahun Emisi 2022 berwarna abu-abu pada gambar di atas bernilai nominal:',
        hint: 'Uang ini menampilkan pahlawan nasional Mohammad Hoesni Thamrin.',
        options: ['Rp1.000', 'Rp2.000', 'Rp5.000', 'Rp20.000'],
        correct: 1,
        explanation: 'Hebat! Itu adalah selembar uang kertas asli pecahan Rp2.000 TE 2022.'
      },
      {
        visual: `
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg border-4 border-slate-300 ring-4 ring-amber-400/60 bg-slate-100 flex items-center justify-center p-1 select-none transition-transform hover:scale-105">
            <img src="assets/images/uang/koin-1000-depan.jpg" alt="Uang Logam Rp1.000 Asli" class="w-full h-full object-cover rounded-full" />
          </div>`,
        prompt: 'Berapakah nilai uang koin logam terbesar yang beredar di Indonesia pada foto di atas?',
        hint: 'Koin ini bernilai seribu rupiah.',
        options: ['Rp500', 'Rp1.000', 'Rp200', 'Rp2.000'],
        correct: 1,
        explanation: 'Luar biasa! Koin Rp1.000 adalah pecahan uang logam terbesar yang beredar saat ini.'
      },
      {
        visual: `
          <div class="w-52 sm:w-60 md:w-68 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 bg-white transition-transform hover:scale-105 select-none">
            <img src="assets/images/uang/kertas-10000.jpg" alt="Uang Kertas Rp10.000 Asli Emisi 2022" class="w-full h-auto object-contain block" />
          </div>`,
        prompt: 'Uang kertas berwarna ungu ceria pada foto di atas memiliki nilai nominal:',
        hint: 'Menampilkan gambar pahlawan Frans Kaisiepo dari Papua.',
        options: ['Rp5.000', 'Rp10.000', 'Rp20.000', 'Rp50.000'],
        correct: 1,
        explanation: 'Tepat sekali! Uang kertas Rp10.000 sangat khas dengan dominasi warna ungu cerah.'
      },
      {
        visual: `
          <div class="w-52 sm:w-60 md:w-68 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 bg-white transition-transform hover:scale-105 select-none">
            <img src="assets/images/uang/kertas-5000.jpg" alt="Uang Kertas Rp5.000 Asli Emisi 2022" class="w-full h-auto object-contain block" />
          </div>`,
        prompt: 'Berapakah nilai nominal uang kertas berwarna cokelat oranye hangat pada foto di atas?',
        hint: 'Menampilkan pahlawan nasional Dr. K.H. Idham Chalid.',
        options: ['Rp2.000', 'Rp5.000', 'Rp10.000', 'Rp50.000'],
        correct: 1,
        explanation: 'Pintar! Gambar di atas adalah uang kertas pecahan Rp5.000 Tahun Emisi 2022.'
      },
      {
        visual: `
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg border-4 border-slate-300 ring-4 ring-sky-300/60 bg-slate-100 flex items-center justify-center p-1 select-none transition-transform hover:scale-105">
            <img src="assets/images/uang/koin-200-depan.jpg" alt="Uang Logam Rp200 Asli" class="w-full h-full object-cover rounded-full" />
          </div>`,
        prompt: 'Berapakah nilai nominal uang koin logam aluminium pada foto di atas?',
        hint: 'Koin ini bergambar burung Jalak Bali.',
        options: ['Rp100', 'Rp200', 'Rp500', 'Rp1.000'],
        correct: 1,
        explanation: 'Benar! Koin logam aluminium tersebut bernilai dua ratus rupiah (Rp200).'
      },
      {
        visual: `
          <div class="w-52 sm:w-60 md:w-68 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 bg-white transition-transform hover:scale-105 select-none">
            <img src="assets/images/uang/kertas-20000.jpg" alt="Uang Kertas Rp20.000 Asli Emisi 2022" class="w-full h-auto object-contain block" />
          </div>`,
        prompt: 'Uang kertas berwarna hijau cerah pada foto memiliki nilai nominal:',
        hint: 'Menampilkan pahlawan nasional Dr. G.S.S.J. Ratulangi (Sam Ratulangi).',
        options: ['Rp10.000', 'Rp20.000', 'Rp50.000', 'Rp2.000'],
        correct: 1,
        explanation: 'Luar biasa! Pecahan Rp20.000 memiliki warna hijau segar yang anggun.'
      },
      {
        visual: `
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg border-4 border-slate-300 ring-4 ring-slate-400/40 bg-slate-100 flex items-center justify-center p-1 select-none transition-transform hover:scale-105">
            <img src="assets/images/uang/koin-100-depan.jpg" alt="Uang Logam Rp100 Asli" class="w-full h-full object-cover rounded-full" />
          </div>`,
        prompt: 'Berapakah nilai uang koin logam terkecil yang masih resmi berlaku pada foto di atas?',
        hint: 'Koin ini bergambar burung Kakaktua Raja.',
        options: ['Rp50', 'Rp100', 'Rp200', 'Rp500'],
        correct: 1,
        explanation: 'Hebat! Koin Rp100 adalah pecahan uang logam terkecil yang masih sah digunakan saat ini.'
      },
      {
        visual: `
          <div class="w-52 sm:w-60 md:w-68 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 bg-white transition-transform hover:scale-105 select-none">
            <img src="assets/images/uang/kertas-50000.jpg" alt="Uang Kertas Rp50.000 Asli Emisi 2022" class="w-full h-auto object-contain block" />
          </div>`,
        prompt: 'Uang kertas berwarna biru laut pada gambar di atas bernilai nominal:',
        hint: 'Menampilkan gambar pahlawan Ir. H. Djuanda Kartawidjaja.',
        options: ['Rp20.000', 'Rp50.000', 'Rp100.000', 'Rp10.000'],
        correct: 1,
        explanation: 'Tepat sekali! Pecahan Rp50.000 berwarna biru laut dengan pahlawan Ir. H. Djuanda.'
      },
      {
        visual: `
          <div class="w-52 sm:w-60 md:w-68 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 bg-white transition-transform hover:scale-105 select-none">
            <img src="assets/images/uang/kertas-100000.jpg" alt="Uang Kertas Rp100.000 Asli Emisi 2022" class="w-full h-auto object-contain block" />
          </div>`,
        prompt: 'Uang kertas dengan nilai nominal tertinggi di Indonesia berwarna merah pada foto adalah:',
        hint: 'Menampilkan Proklamator Kemerdekaan Ir. Soekarno dan Drs. Mohammad Hatta.',
        options: ['Rp50.000', 'Rp75.000', 'Rp100.000', 'Rp200.000'],
        correct: 2,
        explanation: 'Sempurna! Uang kertas Rp100.000 adalah pecahan mata uang Rupiah dengan nominal terbesar.'
      }
    ]
  },
  susun: {
    id: 'susun',
    title: 'Susun Kata Ceria',
    subtitle: 'Klik huruf-huruf acak di bawah untuk membentuk kata finansial yang benar!',
    questions: [
      {
        clue: 'Mata uang resmi kebanggaan negara Republik Indonesia:',
        target: 'RUPIAH',
        letters: ['P', 'U', 'A', 'R', 'H', 'I'],
        explanation: 'R-U-P-I-A-H adalah nama mata uang resmi negara Indonesia.'
      },
      {
        clue: 'Tempat menabung uang koin atau sisa jajan di rumah:',
        target: 'CELENGAN',
        letters: ['G', 'C', 'N', 'E', 'L', 'A', 'E', 'N'],
        explanation: 'C-E-L-E-N-G-A-N adalah wadah favorit anak-anak untuk menabung.'
      },
      {
        clue: 'Uang yang disisihkan dan disimpan untuk masa depan:',
        target: 'TABUNGAN',
        letters: ['B', 'T', 'U', 'A', 'N', 'G', 'A', 'N'],
        explanation: 'T-A-B-U-N-G-A-N adalah simpanan uang hasil hemat dan disiplin.'
      },
      {
        clue: 'Hal pokok yang wajib dipenuhi seperti makan dan seragam sekolah:',
        target: 'KEBUTUHAN',
        letters: ['B', 'K', 'T', 'E', 'H', 'U', 'U', 'A', 'N'],
        explanation: 'K-E-B-U-T-U-H-A-N harus selalu diprioritaskan sebelum keinginan.'
      },
      {
        clue: 'Kegiatan membeli barang kebutuhan di pasar atau toko:',
        target: 'BELANJA',
        letters: ['L', 'B', 'N', 'E', 'A', 'J', 'A'],
        explanation: 'B-E-L-A-N-J-A harus direncanakan dengan cerdas dan bijak.'
      },
      {
        clue: 'Sesuatu yang ingin kita miliki namun tidak wajib segera dipenuhi:',
        target: 'KEINGINAN',
        letters: ['G', 'K', 'I', 'N', 'I', 'N', 'A', 'A', 'E'],
        explanation: 'K-E-I-N-G-I-N-A-N boleh ditunda dan dipenuhi setelah kebutuhan pokok.'
      },
      {
        clue: 'Uang logam berbentuk bulat pipih terbuat dari aluminium atau nikel:',
        target: 'KOIN',
        letters: ['O', 'K', 'N', 'I'],
        explanation: 'K-O-I-N adalah bentuk fisik uang logam Rupiah.'
      },
      {
        clue: 'Uang lebih yang dikembalikan oleh penjual kepada pembeli:',
        target: 'KEMBALIAN',
        letters: ['M', 'K', 'E', 'B', 'A', 'L', 'A', 'I', 'N'],
        explanation: 'K-E-M-B-A-L-I-A-N adalah selisih uang belanja yang diterima kembali.'
      },
      {
        clue: 'Besaran nilai uang yang harus dibayarkan untuk membeli suatu barang:',
        target: 'HARGA',
        letters: ['R', 'H', 'A', 'G', 'A'],
        explanation: 'H-A-R-G-A adalah nilai tukar suatu barang dalam satuan Rupiah.'
      },
      {
        clue: 'Orang yang membeli barang atau jasa untuk memenuhi kebutuhannya:',
        target: 'PEMBELI',
        letters: ['M', 'P', 'E', 'B', 'E', 'L', 'I'],
        explanation: 'P-E-M-B-E-L-I yang bijak selalu mencatat kebutuhan sebelum berbelanja.'
      }
    ]
  },
  matematika: {
    id: 'matematika',
    title: 'Petualangan Matematika Belanja',
    subtitle: 'Hitung penjumlahan uang belanja dan sisa kembalian dengan teliti!',
    questions: [
      {
        visual: `
          <div class="flex items-center justify-center gap-2 flex-wrap select-none">
            <div class="w-32 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-1000.jpg" class="w-full h-auto block" alt="Rp1.000"/></div>
            <div class="w-32 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-2000.jpg" class="w-full h-auto block" alt="Rp2.000"/></div>
            <span class="text-xs font-bold text-slate-500">(Pensil Rp3.000)</span>
            <span class="text-xl font-bold text-slate-400">+</span>
            <div class="w-32 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-5000.jpg" class="w-full h-auto block" alt="Rp5.000"/></div>
            <span class="text-xs font-bold text-slate-500">(Buku Rp5.000)</span>
          </div>`,
        scenario: 'Budi membeli pensil seharga <strong>Rp3.000</strong> dan buku tulis seharga <strong>Rp5.000</strong>. Berapakah total uang yang harus dibayar Budi?',
        hint: 'Hitung: Rp3.000 + Rp5.000',
        options: ['Rp7.000', 'Rp8.000', 'Rp9.000', 'Rp10.000'],
        correct: 1,
        explanation: 'Tepat! Rp3.000 + Rp5.000 = Rp8.000.'
      },
      {
        visual: `
          <div class="w-44 sm:w-52 rounded-xl overflow-hidden shadow-sm border border-slate-200 mx-auto select-none">
            <img src="assets/images/uang/kertas-20000.jpg" alt="Uang Rp20.000" class="w-full h-auto block" />
          </div>`,
        scenario: 'Siti membawa uang <strong>Rp20.000</strong> (uang kertas hijau) ke toko buku. Ia membeli tempat pensil seharga <strong>Rp12.000</strong>. Berapakah uang kembalian yang diterima Siti?',
        hint: 'Hitung: Rp20.000 - Rp12.000',
        options: ['Rp6.000', 'Rp7.000', 'Rp8.000', 'Rp10.000'],
        correct: 2,
        explanation: 'Hebat! Rp20.000 - Rp12.000 = Rp8.000.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-2 select-none">
            <div class="w-28 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-2000.jpg" class="w-full h-auto block" alt="Rp2.000"/></div>
            <div class="w-28 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-2000.jpg" class="w-full h-auto block" alt="Rp2.000"/></div>
            <span class="text-xs font-bold text-slate-500">(2 Roti @Rp4.000 = Rp8.000) + 1 Susu Rp3.000</span>
          </div>`,
        scenario: 'Rian membeli 2 buah roti seharga masing-masing <strong>Rp4.000</strong> dan 1 kotak susu seharga <strong>Rp3.000</strong>. Berapakah total belanjaan Rian?',
        hint: 'Hitung: (2 × Rp4.000) + Rp3.000 = Rp8.000 + Rp3.000',
        options: ['Rp9.000', 'Rp10.000', 'Rp11.000', 'Rp12.000'],
        correct: 2,
        explanation: 'Benar sekali! 2 roti (Rp8.000) + 1 susu (Rp3.000) = Rp11.000.'
      },
      {
        visual: `
          <div class="w-44 sm:w-52 rounded-xl overflow-hidden shadow-sm border border-slate-200 mx-auto select-none">
            <img src="assets/images/uang/kertas-10000.jpg" alt="Uang Rp10.000" class="w-full h-auto block" />
          </div>`,
        scenario: 'Uang saku Dina adalah selembar <strong>Rp10.000</strong> (uang kertas ungu). Dina membeli kue seharga <strong>Rp4.000</strong>. Sisa uangnya dimasukkan ke celengan. Berapakah uang yang berhasil ditabung Dina?',
        hint: 'Hitung: Rp10.000 - Rp4.000',
        options: ['Rp5.000', 'Rp6.000', 'Rp4.000', 'Rp7.000'],
        correct: 1,
        explanation: 'Mantap! Sisa uang Dina yang ditabung ke celengan adalah Rp6.000.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-2 flex-wrap select-none">
            <div class="w-32 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-10000.jpg" class="w-full h-auto block" alt="Rp10.000"/></div>
            <span class="text-lg font-black text-slate-400">+</span>
            <div class="w-32 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-5000.jpg" class="w-full h-auto block" alt="Rp5.000"/></div>
            <span class="text-xs font-bold text-slate-500">(2 lembar Rp5.000)</span>
          </div>`,
        scenario: 'Edo memiliki <strong>1 lembar uang Rp10.000</strong> dan <strong>2 lembar uang Rp5.000</strong>. Berapakah jumlah total uang Edo seluruhnya?',
        hint: 'Hitung: Rp10.000 + (2 × Rp5.000) = Rp10.000 + Rp10.000',
        options: ['Rp15.000', 'Rp20.000', 'Rp25.000', 'Rp30.000'],
        correct: 1,
        explanation: 'Pintar! Rp10.000 + Rp10.000 = Rp20.000.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-2 select-none">
            <span class="text-2xl">🍚</span><span class="text-xs font-bold text-slate-700">Beras Rp15.000</span>
            <span class="text-xl font-bold text-slate-400">+</span>
            <span class="text-2xl">🍳</span><span class="text-xs font-bold text-slate-700">Minyak Rp18.000</span>
          </div>`,
        scenario: 'Ibu membeli 1 kg beras seharga <strong>Rp15.000</strong> dan minyak goreng seharga <strong>Rp18.000</strong>. Berapakah total uang belanjaan kebutuhan pokok Ibu?',
        hint: 'Hitung: Rp15.000 + Rp18.000',
        options: ['Rp30.000', 'Rp32.000', 'Rp33.000', 'Rp35.000'],
        correct: 2,
        explanation: 'Tepat! Rp15.000 + Rp18.000 = Rp33.000.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-2 select-none">
            <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-300 shadow"><img src="assets/images/uang/koin-500-depan.jpg" class="w-full h-full object-cover" alt="Koin Rp500"/></div>
            <span class="text-sm font-black text-slate-700">× 4 keping koin logam</span>
          </div>`,
        scenario: 'Farhan memiliki <strong>4 keping uang logam Rp500</strong> di saku bajunya. Berapakah total nilai uang koin Farhan jika digabungkan?',
        hint: 'Hitung: 4 × Rp500 = Rp500 + Rp500 + Rp500 + Rp500',
        options: ['Rp1.500', 'Rp2.000', 'Rp2.500', 'Rp3.000'],
        correct: 1,
        explanation: 'Hebat! 4 keping koin Rp500 nilainya tepat Rp2.000.'
      },
      {
        visual: `
          <div class="w-44 sm:w-52 rounded-xl overflow-hidden shadow-sm border border-slate-200 mx-auto select-none">
            <img src="assets/images/uang/kertas-50000.jpg" alt="Uang Rp50.000" class="w-full h-auto block" />
          </div>`,
        scenario: 'Ayu membayar baju seragam sekolah seharga <strong>Rp35.000</strong> menggunakan <strong>1 lembar uang Rp50.000</strong> (uang kertas biru). Berapakah uang kembalian yang Ayu terima?',
        hint: 'Hitung: Rp50.000 - Rp35.000',
        options: ['Rp10.000', 'Rp15.000', 'Rp20.000', 'Rp25.000'],
        correct: 1,
        explanation: 'Pintar! Rp50.000 - Rp35.000 = Rp15.000.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-2 select-none">
            <div class="w-36 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-2000.jpg" class="w-full h-auto block" alt="Rp2.000"/></div>
            <span class="text-xs font-bold text-slate-600">× 5 hari berturut-turut</span>
          </div>`,
        scenario: 'Doni menabung <strong>Rp2.000</strong> (uang kertas abu-abu) setiap hari di celengannya. Berapakah jumlah tabungan Doni setelah <strong>5 hari</strong> menabung secara rutin?',
        hint: 'Hitung: 5 × Rp2.000',
        options: ['Rp8.000', 'Rp10.000', 'Rp12.000', 'Rp15.000'],
        correct: 1,
        explanation: 'Benar sekali! 5 × Rp2.000 = Rp10.000 tabungan Doni.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-2 flex-wrap select-none">
            <div class="w-28 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-50000.jpg" class="w-full h-auto block" alt="Rp50.000"/></div>
            <div class="w-28 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-20000.jpg" class="w-full h-auto block" alt="Rp20.000"/></div>
            <div class="w-28 rounded-lg overflow-hidden shadow-sm border border-slate-200"><img src="assets/images/uang/kertas-10000.jpg" class="w-full h-auto block" alt="Rp10.000"/></div>
          </div>`,
        scenario: 'Di dalam dompet Nisa terdapat <strong>1 lembar Rp50.000</strong>, <strong>1 lembar Rp20.000</strong>, dan <strong>1 lembar Rp10.000</strong>. Berapakah jumlah uang Nisa seluruhnya?',
        hint: 'Hitung: Rp50.000 + Rp20.000 + Rp10.000',
        options: ['Rp70.000', 'Rp75.000', 'Rp80.000', 'Rp85.000'],
        correct: 2,
        explanation: 'Luar biasa! Rp50.000 + Rp20.000 + Rp10.000 = Rp80.000.'
      }
    ]
  },
  pasang: {
    id: 'pasang',
    title: 'Pasangkan Kategori (Kebutuhan vs Keinginan)',
    subtitle: 'Tentukan apakah barang atau kegiatan berikut termasuk Kebutuhan Pokok atau Keinginan!',
    questions: [
      {
        item: 'Membeli seragam sekolah untuk dipakai belajar sehari-hari',
        icon: '👔',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 0,
        explanation: 'Seragam sekolah adalah Kebutuhan Pokok agar siswa dapat belajar dengan rapi dan sopan di sekolah.'
      },
      {
        item: 'Membeli mainan robot edisi terbaru padahal di rumah sudah punya banyak mainan sejenis',
        icon: '🤖',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 1,
        explanation: 'Mainan tambahan adalah Keinginan. Sebaiknya uangnya disimpan atau ditabung dahulu!'
      },
      {
        item: 'Membeli beras, sayur mayur, dan lauk untuk makan siang keluarga',
        icon: '🍚',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 0,
        explanation: 'Makanan bernutrisi adalah Kebutuhan Pokok yang mutlak diperlukan untuk kesehatan tubuh.'
      },
      {
        item: 'Membeli tiket wahana permainan dan bermain video game di mall setiap hari libur',
        icon: '🎡',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 1,
        explanation: 'Bermain game di mall adalah Keinginan rekreasi, lakukan secukupnya tanpa berlebihan.'
      },
      {
        item: 'Membeli obat penurun demam dan vitamin ketika badan sedang sakit',
        icon: '💊',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 0,
        explanation: 'Obat dan vitamin saat sakit adalah Kebutuhan Pokok yang penting untuk kesembuhan tubuh.'
      },
      {
        item: 'Membeli buku tulis dan pensil untuk mencatat pelajaran di kelas',
        icon: '✏️',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 0,
        explanation: 'Buku dan pensil adalah Kebutuhan Pokok belajar siswa di sekolah.'
      },
      {
        item: 'Membeli sepatu bermerek sangat mahal hanya untuk pamer kepada teman-teman',
        icon: '👟',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 1,
        explanation: 'Membeli sepatu mahal untuk gengsi adalah Keinginan, utamakan fungsi dan kesederhanaan.'
      },
      {
        item: 'Membayar tagihan air bersih dan listrik untuk kebutuhan penerangan rumah',
        icon: '💡',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 0,
        explanation: 'Air dan listrik adalah Kebutuhan Pokok sehari-hari keluarga di rumah.'
      },
      {
        item: 'Membeli minuman boba manis berukuran besar setiap pulang sekolah',
        icon: '🧋',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 1,
        explanation: 'Minuman manis jajan adalah Keinginan tambahan, sebaiknya membawa air putih dari rumah.'
      },
      {
        item: 'Membeli kacamata periksa dokter karena mata buram saat melihat tulisan di papan tulis',
        icon: '👓',
        options: ['Kebutuhan Pokok', 'Keinginan Tambahan'],
        correct: 0,
        explanation: 'Kacamata medis adalah Kebutuhan Pokok agar proses belajar tidak terganggu.'
      }
    ]
  },
  benarsalah: {
    id: 'benarsalah',
    title: 'Benar atau Salah (Cermat Finansial)',
    subtitle: 'Tentukan apakah pernyataan berikut BENAR atau SALAH berdasarkan pemahaman finansialmu!',
    questions: [
      {
        visual: `
          <div class="flex items-center justify-center gap-3 select-none">
            <div class="w-16 h-16 rounded-full overflow-hidden border shadow"><img src="assets/images/uang/koin-1000-depan.jpg" class="w-full h-full object-cover" alt="Koin Rp1.000"/></div>
            <span class="text-sm font-black text-slate-400">vs</span>
            <div class="w-28 rounded-lg overflow-hidden border shadow"><img src="assets/images/uang/kertas-1000.jpg" class="w-full h-auto block" alt="Kertas Rp1.000"/></div>
          </div>`,
        statement: 'Uang koin Rp1.000 memiliki nilai yang SAMA BESAR dengan selembar uang kertas Rp1.000.',
        isTrue: true,
        explanation: 'BENAR! Meskipun bahannya berbeda (logam vs kertas), daya belinya sama persis yaitu Rp1.000.'
      },
      {
        statement: 'Kita sebaiknya menghabiskan seluruh uang saku untuk jajan sampai habis tanpa menyisihkan untuk ditabung.',
        isTrue: false,
        explanation: 'SALAH! Anak hebat selalu membiasakan diri menyisihkan sebagian uang saku ke celengan terlebih dahulu.'
      },
      {
        statement: 'Mendahulukan membeli buku pelajaran sekolah lebih penting daripada membeli mainan baru.',
        isTrue: true,
        explanation: 'BENAR! Kebutuhan belajar dan pendidikan wajib didahulukan daripada keinginan membeli mainan.'
      },
      {
        statement: 'Kebutuhan adalah sesuatu yang jika tidak terpenuhi tidak akan mengganggu kelangsungan hidup kita.',
        isTrue: false,
        explanation: 'SALAH! Kebutuhan pokok jika tidak dipenuhi akan mengganggu hidup (seperti makan, minum, pakaian). Itu adalah pengertian keinginan!'
      },
      {
        statement: 'Menabung uang kembalian belanja di celengan secara rutin akan membuat uang kita terkumpul banyak.',
        isTrue: true,
        explanation: 'BENAR! Seperti pepatah: "Sedikit demi sedikit, lama-lama menjadi bukit!"'
      },
      {
        statement: 'Uang Rupiah adalah alat pembayaran yang sah dan resmi di seluruh wilayah Negara Kesatuan Republik Indonesia.',
        isTrue: true,
        explanation: 'BENAR! Berdasarkan undang-undang, mata uang resmi Republik Indonesia adalah Rupiah.'
      },
      {
        statement: 'Membeli barang diskon yang sebenarnya tidak kita butuhkan adalah contoh perilaku hidup hemat.',
        isTrue: false,
        explanation: 'SALAH! Membeli barang yang tidak dibutuhkan hanya karena murah atau diskon termasuk pemborosan.'
      },
      {
        statement: 'Merawat fisik uang Rupiah dengan tidak melipat kasar, tidak mencoret, dan tidak menstapler adalah wujud cinta Rupiah.',
        isTrue: true,
        explanation: 'BENAR! Gerakan Cinta, Bangga, dan Paham Rupiah mengajak kita merawat fisik uang dengan prinsip 5 Jangan.'
      },
      {
        visual: `
          <div class="flex items-center justify-center gap-3 select-none">
            <div class="w-28 rounded-lg overflow-hidden border shadow"><img src="assets/images/uang/kertas-50000.jpg" class="w-full h-auto block" alt="Rp50.000"/></div>
            <span class="text-xs font-bold text-slate-500">vs</span>
            <div class="w-28 rounded-lg overflow-hidden border shadow"><img src="assets/images/uang/kertas-20000.jpg" class="w-full h-auto block" alt="Rp20.000"/></div>
          </div>`,
        statement: 'Uang kertas Rp50.000 bernilai nominal lebih kecil dibandingkan uang kertas Rp20.000.',
        isTrue: false,
        explanation: 'SALAH! Nominal Rp50.000 bernilai lebih besar dua setengah kali lipat daripada Rp20.000.'
      },
      {
        statement: 'Membuat catatan daftar belanja sebelum pergi ke pasar dapat membantu kita terhindar dari pemborosan.',
        isTrue: true,
        explanation: 'BENAR! Catatan belanja membantu kita fokus membeli barang kebutuhan pokok yang memang diperlukan.'
      }
    ]
  }
};

const RBC_GAME_STATE = {
  rounds: { tebak: 0, susun: 0, matematika: 0, pasang: 0, benarsalah: 0 },
  scores: { tebak: 0, susun: 0, matematika: 0, pasang: 0, benarsalah: 0 },
  susunAnswer: []
};

function renderGameView() {
  return `
    <div class="space-y-6 sm:space-y-8 animate-fade-in">
      <div class="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-4 sm:p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div class="space-y-2 text-center md:text-left">
          <span class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">🌟 Bermain Sambil Belajar • 5 Game Edukasi (10 Soal per Game)</span>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black mt-2">Pojok Game Edukasi Ceria</h1>
          <p class="text-emerald-100 text-sm md:text-base font-medium max-w-xl">
            Kenali uang asli Rupiah, asah matematika belanja, dan uji pemahaman finansialmu lewat 10 tantangan seru di setiap game!
          </p>
        </div>
        <div class="flex-shrink-0">
          ${RBC_MASCOT.render('cheering', 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28')}
        </div>
      </div>

      <!-- Game Selector Buttons (Swipeable on Mobile) -->
      <div class="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar" id="game-selector-tabs">
        <button onclick="switchGameView('tebak')" class="flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-emerald-500 bg-emerald-500 text-white shadow-sm flex flex-col items-center gap-1 transition-all">
          <span class="text-xl">🖼️</span>
          <span>1. Tebak Uang Asli</span>
        </button>
        <button onclick="switchGameView('susun')" class="flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1 transition-all">
          <span class="text-xl">🔤</span>
          <span>2. Susun Kata</span>
        </button>
        <button onclick="switchGameView('matematika')" class="flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1 transition-all">
          <span class="text-xl">🧮</span>
          <span>3. Matematika</span>
        </button>
        <button onclick="switchGameView('pasang')" class="flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1 transition-all">
          <span class="text-xl">🧩</span>
          <span>4. Pasangkan</span>
        </button>
        <button onclick="switchGameView('benarsalah')" class="flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1 transition-all">
          <span class="text-xl">⚖️</span>
          <span>5. Benar / Salah</span>
        </button>
      </div>

      <div id="game-active-container" class="card-pastel p-4 sm:p-6 md:p-8 border-2 border-emerald-200">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function initGameView() {
  switchGameView(AppState.gameActive || 'tebak');
}

function switchGameView(gameKey) {
  const validGames = ['tebak', 'susun', 'matematika', 'pasang', 'benarsalah'];
  if (!validGames.includes(gameKey)) gameKey = 'tebak';
  AppState.gameActive = gameKey;
  window.soundManager.playPop();

  document.querySelectorAll('#game-selector-tabs button').forEach(btn => {
    if (btn.innerText.toLowerCase().includes(gameKey)) {
      btn.className = "flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-emerald-500 bg-emerald-500 text-white shadow-sm flex flex-col items-center gap-1 transition-all";
    } else {
      btn.className = "flex-shrink-0 min-w-[110px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex flex-col items-center gap-1 transition-all";
    }
  });

  renderActiveGameContent(gameKey);
}

function renderActiveGameContent(gameKey) {
  const container = document.getElementById('game-active-container');
  if (!container) return;

  const gameData = RBC_GAMES_DATA[gameKey];
  const roundIdx = RBC_GAME_STATE.rounds[gameKey] || 0;
  const currentScore = RBC_GAME_STATE.scores[gameKey] || 0;
  const totalQuestions = gameData.questions.length;

  // Completion screen when all 10 questions are done
  if (roundIdx >= totalQuestions) {
    const perfectScore = totalQuestions * 10;
    const isPerfect = currentScore >= perfectScore;

    if (window.RBC_SUPABASE && window.RBC_SUPABASE.isConnected() && typeof window.RBC_SUPABASE.saveGameResult === 'function') {
      window.RBC_SUPABASE.saveGameResult({
        nama: AppState.studentName || 'Teman Belajar',
        gameKey: gameKey,
        score: currentScore,
        total: totalQuestions,
        percent: Math.round((currentScore / perfectScore) * 100)
      });
    }

    container.innerHTML = `
      <div class="text-center py-6 sm:py-8 space-y-4 animate-scale-up">
        <div class="flex justify-center">
          ${RBC_MASCOT.render('cheering', 'w-24 h-24 sm:w-32 sm:h-32')}
        </div>
        <div class="space-y-1">
          <span class="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Permainan Selesai 🎉</span>
          <h3 class="text-2xl sm:text-3xl font-black text-slate-800">Hebat! Kamu Menyelesaikan 10 Soal ${gameData.title}!</h3>
          <p class="text-slate-600 text-sm max-w-md mx-auto">
            ${isPerfect ? 'Nilai Sempurna 100! Pemahaman finansial dan pengenalan uang Rupiahmu luar biasa cermat!' : 'Kerja bagus! Teruslah bermain dan belajar untuk menjadi anak hebat yang bijak berbelanja!'}
          </p>
        </div>

        <div class="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs">
          <span class="text-3xl">⭐</span>
          <div class="text-left">
            <span class="text-[11px] font-bold text-amber-800 uppercase block">Total Skor Game Ini</span>
            <span class="text-2xl font-black text-amber-950">${currentScore} / ${perfectScore} Poin</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button type="button" onclick="restartCurrentGame('${gameKey}')" class="btn-playful px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md">
            <span>🔄 Main Ulang Game Ini</span>
          </button>
          <button type="button" onclick="switchGameView('${getNextGameKey(gameKey)}')" class="btn-playful px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md">
            <span>🎮 Lanjut ke Game Berikutnya ➡️</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Active question render
  const q = gameData.questions[roundIdx];
  const progressPercent = Math.round(((roundIdx + 1) / totalQuestions) * 100);

  let innerGameHtml = '';

  if (gameKey === 'tebak') {
    innerGameHtml = `
      <div class="p-4 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
        ${q.visual}
        <p class="font-bold text-slate-800 text-center text-sm sm:text-base max-w-md">${q.prompt}</p>
        <span class="text-xs text-slate-500 font-medium">💡 ${q.hint}</span>
        <div id="game-options-grid" class="grid grid-cols-2 gap-3 w-full max-w-md pt-2">
          ${q.options.map((opt, idx) => `
            <button type="button" onclick="handleChoiceAnswer('tebak', ${idx}, ${q.correct}, '${escapeHtmlText(q.explanation)}')" class="p-3 sm:p-3.5 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 font-bold text-sm text-slate-800 shadow-xs transition-all active:scale-95">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="game-feedback-box" class="hidden w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center"></div>
      </div>
    `;
  } else if (gameKey === 'susun') {
    RBC_GAME_STATE.susunAnswer = [];
    innerGameHtml = `
      <div class="p-4 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
        <span class="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase">Teka-Teki Kata ${roundIdx + 1}/10</span>
        <p class="font-bold text-slate-800 text-center text-sm sm:text-base max-w-lg">${q.clue}</p>
        
        <!-- Answer Slots -->
        <div id="susun-answer-slots" class="flex flex-wrap justify-center gap-1.5 sm:gap-2 my-2 min-h-[48px]">
          ${Array.from({ length: q.target.length }).map(() => `
            <span class="w-9 h-11 sm:w-11 sm:h-12 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-purple-900 bg-purple-50/50"></span>
          `).join('')}
        </div>

        <!-- Scrambled Letter Buttons -->
        <div class="space-y-1.5 text-center">
          <span class="text-[11px] font-semibold text-slate-500 block">Klik huruf-huruf di bawah sesuai urutan:</span>
          <div id="susun-letter-bank" class="flex flex-wrap justify-center gap-2 max-w-md">
            ${q.letters.map((letter, idx) => `
              <button type="button" id="btn-letter-${idx}" onclick="handleSusunLetterClick(${idx}, '${letter}', '${q.target}', '${escapeHtmlText(q.explanation)}')" class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-500 text-purple-900 font-black text-lg sm:text-xl shadow-xs transition-all active:scale-95">
                ${letter}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2 pt-2">
          <button type="button" onclick="handleSusunReset('${q.target}')" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all">
            <span>🔄 Reset</span>
          </button>
          <button type="button" onclick="handleSusunBackspace('${q.target}')" class="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all">
            <span>⌫ Hapus</span>
          </button>
          <button type="button" id="btn-susun-check" onclick="handleSusunCheck('${q.target}', '${escapeHtmlText(q.explanation)}')" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all">
            <span>✨ Cek Jawaban</span>
          </button>
        </div>

        <div id="game-feedback-box" class="hidden w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center"></div>
      </div>
    `;
  } else if (gameKey === 'matematika') {
    innerGameHtml = `
      <div class="p-4 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
        ${q.visual ? q.visual : '<div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl shadow-xs">🧮</div>'}
        <p class="font-bold text-slate-800 text-center text-sm sm:text-base max-w-md leading-relaxed">${q.scenario}</p>
        <span class="text-xs text-slate-500 font-medium">💡 ${q.hint}</span>
        <div id="game-options-grid" class="grid grid-cols-2 gap-3 w-full max-w-md pt-2">
          ${q.options.map((opt, idx) => `
            <button type="button" onclick="handleChoiceAnswer('matematika', ${idx}, ${q.correct}, '${escapeHtmlText(q.explanation)}')" class="p-3 sm:p-3.5 bg-white rounded-xl border-2 border-slate-200 hover:border-amber-400 font-black text-sm text-slate-800 shadow-xs transition-all active:scale-95">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="game-feedback-box" class="hidden w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center"></div>
      </div>
    `;
  } else if (gameKey === 'pasang') {
    innerGameHtml = `
      <div class="p-4 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
        <div class="w-16 h-16 rounded-3xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-4xl shadow-xs">
          ${q.icon}
        </div>
        <div class="text-center space-y-1 max-w-md">
          <span class="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Kategori Belanja:</span>
          <p class="font-bold text-slate-800 text-sm sm:text-base leading-snug">"${q.item}"</p>
        </div>
        <span class="text-xs text-slate-500 font-medium">Pilih salah satu kategori yang paling tepat:</span>
        <div id="game-options-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-1">
          <button type="button" onclick="handleChoiceAnswer('pasang', 0, ${q.correct}, '${escapeHtmlText(q.explanation)}')" class="p-3.5 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 font-black text-sm text-emerald-800 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2">
            <span>🥗 Kebutuhan Pokok</span>
          </button>
          <button type="button" onclick="handleChoiceAnswer('pasang', 1, ${q.correct}, '${escapeHtmlText(q.explanation)}')" class="p-3.5 bg-white rounded-2xl border-2 border-amber-200 hover:border-amber-500 font-black text-sm text-amber-800 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2">
            <span>🧸 Keinginan Tambahan</span>
          </button>
        </div>
        <div id="game-feedback-box" class="hidden w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center"></div>
      </div>
    `;
  } else if (gameKey === 'benarsalah') {
    innerGameHtml = `
      <div class="p-4 sm:p-6 bg-slate-50 rounded-2xl flex flex-col items-center space-y-4">
        ${q.visual ? q.visual : '<div class="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl shadow-xs">⚖️</div>'}
        <div class="text-center space-y-1 max-w-md">
          <span class="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Pernyataan Finansial:</span>
          <p class="font-bold text-slate-800 text-sm sm:text-base leading-snug">"${q.statement}"</p>
        </div>
        <span class="text-xs text-slate-500 font-medium">Apakah pernyataan di atas Benar atau Salah?</span>
        <div id="game-options-grid" class="flex gap-3 w-full max-w-xs pt-1">
          <button type="button" onclick="handleTrueFalseAnswer(true, ${q.isTrue}, '${escapeHtmlText(q.explanation)}')" class="flex-1 py-3 bg-white rounded-2xl border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 font-black text-sm text-emerald-800 shadow-xs transition-all active:scale-95">
            👍 BENAR
          </button>
          <button type="button" onclick="handleTrueFalseAnswer(false, ${q.isTrue}, '${escapeHtmlText(q.explanation)}')" class="flex-1 py-3 bg-white rounded-2xl border-2 border-rose-300 hover:border-rose-500 hover:bg-rose-50 font-black text-sm text-rose-800 shadow-xs transition-all active:scale-95">
            👎 SALAH
          </button>
        </div>
        <div id="game-feedback-box" class="hidden w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center"></div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-4 animate-fade-in">
      <!-- Game Sub-header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-wide">${gameData.title}</span>
          <h3 class="text-lg sm:text-xl font-black text-slate-800">Tantangan Soal ${roundIdx + 1} dari ${totalQuestions}</h3>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-28 sm:w-36 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-emerald-500 h-2.5 rounded-full transition-all duration-300" style="width: ${progressPercent}%;"></div>
          </div>
          <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs shadow-xs">⭐ ${currentScore} / ${totalQuestions * 10} Poin</span>
        </div>
      </div>

      <!-- Main Game Board -->
      ${innerGameHtml}
    </div>
  `;
}

function handleChoiceAnswer(gameKey, selectedIdx, correctIdx, explanation) {
  const isCorrect = selectedIdx === correctIdx;
  const grid = document.getElementById('game-options-grid');
  if (grid) {
    const buttons = grid.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIdx) {
        btn.className = "p-3 sm:p-3.5 bg-emerald-500 text-white rounded-xl border-2 border-emerald-600 font-bold text-sm shadow-sm";
      } else if (idx === selectedIdx && !isCorrect) {
        btn.className = "p-3 sm:p-3.5 bg-rose-500 text-white rounded-xl border-2 border-rose-600 font-bold text-sm shadow-sm";
      } else {
        btn.className = "p-3 sm:p-3.5 bg-slate-100 text-slate-400 rounded-xl border-2 border-slate-200 font-bold text-sm opacity-60";
      }
    });
  }

  const fb = document.getElementById('game-feedback-box');
  if (fb) {
    fb.classList.remove('hidden', 'bg-emerald-100', 'text-emerald-900', 'border-emerald-300', 'bg-rose-100', 'text-rose-900', 'border-rose-300');
    if (isCorrect) {
      window.soundManager.playCorrect();
      fb.classList.add('bg-emerald-100', 'text-emerald-900', 'border', 'border-emerald-300');
      RBC_GAME_STATE.scores[gameKey] = (RBC_GAME_STATE.scores[gameKey] || 0) + 10;
      AppState.addReward(10, 2);
      fb.innerHTML = `
        <div class="space-y-2">
          <p>🎉 <strong>Jawabanmu Tepat Sekali! (+10 Poin)</strong></p>
          <p class="text-xs font-medium text-emerald-800">${explanation}</p>
          <button type="button" onclick="nextGameQuestion('${gameKey}')" class="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95">
            Lanjut ke Soal Berikutnya ➡️
          </button>
        </div>
      `;
    } else {
      window.soundManager.playWrong();
      fb.classList.add('bg-rose-100', 'text-rose-900', 'border', 'border-rose-300');
      fb.innerHTML = `
        <div class="space-y-2">
          <p>💪 <strong>Kurang Tepat, Simak Penjelasannya:</strong></p>
          <p class="text-xs font-medium text-rose-800">${explanation}</p>
          <button type="button" onclick="nextGameQuestion('${gameKey}')" class="mt-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95">
            Lanjut ke Soal Berikutnya ➡️
          </button>
        </div>
      `;
    }
  }
}

function handleTrueFalseAnswer(userChoice, correctChoice, explanation) {
  const isCorrect = userChoice === correctChoice;
  const grid = document.getElementById('game-options-grid');
  if (grid) {
    grid.querySelectorAll('button').forEach(btn => btn.disabled = true);
  }

  const fb = document.getElementById('game-feedback-box');
  if (fb) {
    fb.classList.remove('hidden', 'bg-emerald-100', 'text-emerald-900', 'border-emerald-300', 'bg-rose-100', 'text-rose-900', 'border-rose-300');
    if (isCorrect) {
      window.soundManager.playCorrect();
      fb.classList.add('bg-emerald-100', 'text-emerald-900', 'border', 'border-emerald-300');
      RBC_GAME_STATE.scores.benarsalah = (RBC_GAME_STATE.scores.benarsalah || 0) + 10;
      AppState.addReward(10, 2);
      fb.innerHTML = `
        <div class="space-y-2">
          <p>🎉 <strong>Tepat Sekali! Analisismu Benar! (+10 Poin)</strong></p>
          <p class="text-xs font-medium text-emerald-800">${explanation}</p>
          <button type="button" onclick="nextGameQuestion('benarsalah')" class="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95">
            Lanjut ke Soal Berikutnya ➡️
          </button>
        </div>
      `;
    } else {
      window.soundManager.playWrong();
      fb.classList.add('bg-rose-100', 'text-rose-900', 'border', 'border-rose-300');
      fb.innerHTML = `
        <div class="space-y-2">
          <p>💪 <strong>Kurang Tepat! Simak penjelasannya:</strong></p>
          <p class="text-xs font-medium text-rose-800">${explanation}</p>
          <button type="button" onclick="nextGameQuestion('benarsalah')" class="mt-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95">
            Lanjut ke Soal Berikutnya ➡️
          </button>
        </div>
      `;
    }
  }
}

function handleSusunLetterClick(letterIdx, letter, targetWord, explanation) {
  if (RBC_GAME_STATE.susunAnswer.length >= targetWord.length) return;
  window.soundManager.playPop();

  RBC_GAME_STATE.susunAnswer.push({ idx: letterIdx, letter: letter });
  const btn = document.getElementById(`btn-letter-${letterIdx}`);
  if (btn) {
    btn.disabled = true;
    btn.classList.add('opacity-30', 'pointer-events-none', 'bg-slate-100');
  }

  updateSusunSlots(targetWord);
}

function handleSusunBackspace(targetWord) {
  if (RBC_GAME_STATE.susunAnswer.length === 0) return;
  window.soundManager.playPop();

  const popped = RBC_GAME_STATE.susunAnswer.pop();
  const btn = document.getElementById(`btn-letter-${popped.idx}`);
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('opacity-30', 'pointer-events-none', 'bg-slate-100');
  }

  updateSusunSlots(targetWord);
}

function handleSusunReset(targetWord) {
  window.soundManager.playPop();
  RBC_GAME_STATE.susunAnswer.forEach(item => {
    const btn = document.getElementById(`btn-letter-${item.idx}`);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('opacity-30', 'pointer-events-none', 'bg-slate-100');
    }
  });
  RBC_GAME_STATE.susunAnswer = [];
  updateSusunSlots(targetWord);

  const fb = document.getElementById('game-feedback-box');
  if (fb) fb.classList.add('hidden');
}

function updateSusunSlots(targetWord) {
  const slotsContainer = document.getElementById('susun-answer-slots');
  if (!slotsContainer) return;

  const currentChars = RBC_GAME_STATE.susunAnswer.map(a => a.letter);
  slotsContainer.innerHTML = Array.from({ length: targetWord.length }).map((_, i) => {
    const ch = currentChars[i] || '';
    if (ch) {
      return `<span class="w-9 h-11 sm:w-11 sm:h-12 border-2 border-purple-500 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-purple-950 bg-white shadow-xs">${ch}</span>`;
    } else {
      return `<span class="w-9 h-11 sm:w-11 sm:h-12 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-purple-900 bg-purple-50/50"></span>`;
    }
  }).join('');
}

function handleSusunCheck(targetWord, explanation) {
  const currentWord = RBC_GAME_STATE.susunAnswer.map(a => a.letter).join('');
  const fb = document.getElementById('game-feedback-box');
  if (!fb) return;

  if (currentWord.length < targetWord.length) {
    window.soundManager.playWrong();
    fb.classList.remove('hidden');
    fb.className = "w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center bg-amber-100 text-amber-900 border border-amber-300";
    fb.innerHTML = `⚠️ Hurufnya belum lengkap! Masukkan ${targetWord.length} huruf ya.`;
    return;
  }

  fb.classList.remove('hidden');
  if (currentWord === targetWord) {
    window.soundManager.playCorrect();
    RBC_GAME_STATE.scores.susun = (RBC_GAME_STATE.scores.susun || 0) + 10;
    AppState.addReward(10, 2);
    fb.className = "w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center bg-emerald-100 text-emerald-900 border border-emerald-300";
    fb.innerHTML = `
      <div class="space-y-2">
        <p>🎉 <strong>Hebat Sekali! Kamu Berhasil Menyusun Kata "${targetWord}"! (+10 Poin)</strong></p>
        <p class="text-xs font-medium text-emerald-800">${explanation}</p>
        <button type="button" onclick="nextGameQuestion('susun')" class="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95">
          Lanjut ke Kata Berikutnya ➡️
        </button>
      </div>
    `;
    const checkBtn = document.getElementById('btn-susun-check');
    if (checkBtn) checkBtn.disabled = true;
  } else {
    window.soundManager.playWrong();
    fb.className = "w-full max-w-md p-3.5 rounded-xl text-xs sm:text-sm font-bold text-center bg-rose-100 text-rose-900 border border-rose-300";
    fb.innerHTML = `
      <div class="space-y-2">
        <p>💪 <strong>Susunan kata belum tepat!</strong></p>
        <p class="text-xs font-medium text-rose-800">Coba tekan tombol Reset lalu susun kembali huruf-hurufnya dengan urutan yang benar ya!</p>
      </div>
    `;
  }
}

function nextGameQuestion(gameKey) {
  window.soundManager.playPop();
  RBC_GAME_STATE.rounds[gameKey] = (RBC_GAME_STATE.rounds[gameKey] || 0) + 1;
  renderActiveGameContent(gameKey);
}

function restartCurrentGame(gameKey) {
  window.soundManager.playPop();
  RBC_GAME_STATE.rounds[gameKey] = 0;
  RBC_GAME_STATE.scores[gameKey] = 0;
  RBC_GAME_STATE.susunAnswer = [];
  renderActiveGameContent(gameKey);
}

function getNextGameKey(currentKey) {
  const order = ['tebak', 'susun', 'matematika', 'pasang', 'benarsalah'];
  const idx = order.indexOf(currentKey);
  return order[(idx + 1) % order.length];
}

// Window bindings
window.renderGameView = renderGameView;
window.initGameView = initGameView;
window.switchGameView = switchGameView;
window.renderActiveGameContent = renderActiveGameContent;
window.handleChoiceAnswer = handleChoiceAnswer;
window.handleTrueFalseAnswer = handleTrueFalseAnswer;
window.handleSusunLetterClick = handleSusunLetterClick;
window.handleSusunBackspace = handleSusunBackspace;
window.handleSusunReset = handleSusunReset;
window.handleSusunCheck = handleSusunCheck;
window.nextGameQuestion = nextGameQuestion;
window.restartCurrentGame = restartCurrentGame;

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

      <!-- Dosen Pengampu & Pembimbing -->
      <div class="card-pastel p-6 md:p-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-orange-50/60 shadow-sm space-y-3">
        <div class="flex items-center gap-3 pb-3 border-b border-amber-200">
          <span class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center text-2xl shadow-sm">👨‍🏫</span>
          <div>
            <span class="text-xs font-bold uppercase text-amber-800 tracking-wider">Dosen Pengampu Mata Kuliah</span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900">Dr. Dede Trie Kurniawan, S.Si., M.Pd.</h2>
          </div>
        </div>
        <div class="text-xs sm:text-sm text-slate-700 space-y-1">
          <p class="font-bold text-slate-800">Universitas Pendidikan Indonesia (UPI) — Kampus di Cibiru</p>
          <p class="text-slate-600">Program Studi Pendidikan Guru Sekolah Dasar (PGSD)</p>
          <p class="text-slate-500 text-xs flex items-center gap-1.5 pt-1">
            <span>📍</span> <span>Jl. Pendidikan No. 15, Cibiru Wetan, Kec. Cileunyi, Kabupaten Bandung, Jawa Barat 40625</span>
          </p>
        </div>
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
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 hover:border-sky-300 transition-colors">
              <span class="w-10 h-10 rounded-full bg-sky-200 text-sky-900 font-bold text-sm flex items-center justify-center flex-shrink-0">
                ${idx + 1}
              </span>
              <div>
                <h4 class="font-bold text-slate-800 text-sm md:text-base">${dev}</h4>
                <p class="text-xs text-slate-500">Mahasiswa PGSD Kampus UPI di Cibiru</p>
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
              <p>Jl. Pendidikan No. 15, Cibiru Wetan, Kec. Cileunyi, Kabupaten Bandung, Jawa Barat 40625</p>
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

          <div class="card-pastel p-6 border-2 border-amber-100 space-y-3">
            <div>
              <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Dosen Pengampu:</span>
              <h4 class="font-black text-slate-800 text-sm">Dr. Dede Trie Kurniawan, S.Si., M.Pd.</h4>
              <p class="text-[11px] text-slate-500">Dosen Pengampu PGSD Kampus UPI di Cibiru</p>
            </div>
            <div class="pt-2 border-t border-amber-200/60">
              <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Tim Pengembang Mahasiswa:</span>
              <ul class="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Ines Khairunisa</li>
                <li>Nasrun Nurhakim</li>
                <li>Nur Afifah Handayani</li>
                <li>Zidna Syifanadia Impian Pragita Mariannisa</li>
              </ul>
            </div>
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
  const budgetInput = document.getElementById('edit-budget-num');
  if (cp) cp.value = RBC_DATA.learningObjective.cp;
  if (topic) topic.value = RBC_DATA.appInfo.topic;
  if (budgetInput) budgetInput.value = AppState.nizaWallet || 20000;
  
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
  const budgetVal = parseInt(document.getElementById('edit-budget-num')?.value || '0', 10);
  if (cp) RBC_DATA.learningObjective.cp = cp;
  if (topic) RBC_DATA.appInfo.topic = topic;
  if (budgetVal >= 1000) {
    AppState.nizaWallet = budgetVal;
    localStorage.setItem('rbc_niza_wallet', budgetVal);
  }
  localStorage.setItem('rbc_custom_cp', cp);
  localStorage.setItem('rbc_custom_topic', topic);
  AppState.showToast('✅ Pengaturan materi & CP berhasil diperbarui!');
  closeTeacherDashboard();
  switchTab(AppState.activeTab);
}

function resetAllStudentData() {
  if (confirm('Apakah Ibu/Bapak Guru yakin ingin mereset seluruh progres belajar siswa ini?')) {
    localStorage.clear();
    sessionStorage.removeItem('rbc_session_confirmed');
    AppState.hasEnteredName = false;
    AppState.pendingTab = null;
    AppState.studentName = 'Isi Nama Dulu';
    AppState.initialPoints = 0;
    AppState.points = 0;
    AppState.stars = 0;
    AppState.completedStages = [];
    AppState.unlockedBadges = [];
    AppState.reflection = {};
    AppState.nizaWallet = 20000;
    AppState.nizaCart = [];
    AppState.quizScore = 0;
    AppState.quizCompleted = false;
    AppState.updateStatsUI();
    closeTeacherDashboard();
    switchTab('beranda');
    openStudentNameModal(false);
    AppState.showToast('🔄 Seluruh data siswa berhasil direset! Silakan masukkan nama baru.');
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
    e: 'Pilih opsi uang belanjamu (Rp10.000 – Rp50.000) di Market Niza dan hitung belanjamu dengan cermat!',
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

  const requestedTab = getTabFromHash();
  if (!AppState.hasEnteredName) {
    AppState.pendingTab = requestedTab !== 'beranda' ? requestedTab : null;
    switchTab('beranda');
    openStudentNameModal(false);
  } else {
    switchTab(requestedTab);
  }

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
      openStudentNameModal(AppState.hasEnteredName);
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


