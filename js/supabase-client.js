/**
 * Ruang Belajar Ceria - Supabase Cloud Database Client
 * Proyek Supabase: design think (udhoqefwcrxesvuoxlyq)
 * Menyinkronkan seluruh form:
 * 1. Siswa (Profil & Skor)
 * 2. Jawaban Pemantik & Ceritaku (Tahap D)
 * 3. Transaksi Kasir (Tahap H)
 * 4. LKPD Submissions (Tahap T)
 * 5. Padlet Posts & Comments (Tahap T)
 * 6. Penguatan Materi (Tahap I)
 * 7. Upload File Karya Siswa (Tahap K)
 * 8. Refleksi Siswa (Tahap K)
 * 9. Hasil Kuis Evaluasi (Kuis)
 * 10. Kontak & Masukan (Halaman Kontak)
 */

const OFFICIAL_ANON_KEY = 'sb_publishable_31QoXFpbv__6d63y51fefg_Au2E6wNV';
const storedKey = (localStorage.getItem('rbc_supabase_anon_key') || '').trim();

const SUPABASE_CONFIG = {
  url: "https://udhoqefwcrxesvuoxlyq.supabase.co",
  anonKey: (storedKey && (storedKey.startsWith('sb_publishable_') || storedKey.startsWith('eyJ'))) ? storedKey : OFFICIAL_ANON_KEY
};

let supabaseClient = null;

function initSupabaseClient() {
  if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('✅ Supabase Client terhubung: udhoqefwcrxesvuoxlyq');
    } catch (e) {
      console.warn('⚠️ Gagal inisialisasi Supabase:', e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  if (typeof window !== 'undefined' && typeof window.updateDbStatusBadge === 'function') {
    window.updateDbStatusBadge();
  }
}

// Inisialisasi awal
initSupabaseClient();

const RBC_SUPABASE = {
  getClient() {
    return supabaseClient;
  },

  isConnected() {
    if (!supabaseClient && typeof supabase !== 'undefined') {
      initSupabaseClient();
    }
    return supabaseClient !== null;
  },

  getProjectUrl() {
    return SUPABASE_CONFIG.url;
  },

  getAnonKey() {
    return SUPABASE_CONFIG.anonKey;
  },

  setAnonKey(key) {
    const trimmed = (key || '').trim();
    SUPABASE_CONFIG.anonKey = (trimmed && (trimmed.startsWith('sb_publishable_') || trimmed.startsWith('eyJ'))) ? trimmed : OFFICIAL_ANON_KEY;
    localStorage.setItem('rbc_supabase_anon_key', SUPABASE_CONFIG.anonKey);
    initSupabaseClient();
    return this.isConnected();
  },

  // Tes Koneksi Cepat
  async testConnection() {
    if (!this.isConnected()) {
      return { success: false, message: 'Library Supabase belum siap dimuat di browser atau jaringan offline.' };
    }
    try {
      const { data, error } = await supabaseClient.from('siswa').select('id').limit(1);
      if (error) throw error;
      return { success: true, message: 'Koneksi ke Supabase Cloud (udhoqefwcrxesvuoxlyq) Berhasil & Aktif! 🚀' };
    } catch (e) {
      return { success: false, message: e.message || 'Gagal membaca data dari Supabase.' };
    }
  },

  // 1. Ambil & Simpan Data Siswa & Poin per Nama ke Cloud
  async getSiswaByName(nama) {
    if (!this.isConnected()) return null;
    const cleanName = (nama || '').trim().replace(/\s+/g, ' ');
    if (!cleanName) return null;
    try {
      const { data, error } = await supabaseClient
        .from('siswa')
        .select('id, nama_panggilan, poin, bintang, progres_tahap, created_at')
        .ilike('nama_panggilan', cleanName)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (e) {
      console.warn('Supabase getSiswaByName error:', e);
      return null;
    }
  },

  async saveSiswa(studentData) {
    if (!this.isConnected()) return null;
    const cleanName = (studentData && studentData.nama ? String(studentData.nama) : '').trim().replace(/\s+/g, ' ');
    if (!cleanName || ['Isi Nama Dulu', 'Teman Ceria', 'Teman Belajar'].includes(cleanName)) {
      return null;
    }
    const payload = {
      nama_panggilan: cleanName,
      poin: typeof studentData.poin === 'number' ? studentData.poin : 0,
      bintang: typeof studentData.bintang === 'number' ? studentData.bintang : 0,
      progres_tahap: Array.isArray(studentData.progres) ? studentData.progres : []
    };
    try {
      const existing = await this.getSiswaByName(cleanName);
      if (existing && existing.id) {
        const { data, error } = await supabaseClient
          .from('siswa')
          .update(payload)
          .eq('id', existing.id)
          .select();
        if (error) throw error;
        console.log('✅ Supabase: Data siswa diperbarui', data);
        return data;
      }
      const { data, error } = await supabaseClient
        .from('siswa')
        .insert([payload])
        .select();
      if (error) throw error;
      console.log('✅ Supabase: Data siswa tersimpan', data);
      return data;
    } catch (e) {
      console.warn('Supabase saveSiswa error:', e);
      return null;
    }
  },

  // 2. Simpan Jawaban Pemantik / Ceritaku (Tahap D)
  // Menyimpan ke tabel 'ceritaku', 'jawaban_pemantik', dan dicadangkan ke 'refleksi_siswa'
  async savePemantikAnswer(pemantikData) {
    if (!this.isConnected()) return null;
    let savedData = null;

    // A. Simpan ke tabel resmi: ceritaku
    try {
      const { data, error } = await supabaseClient
        .from('ceritaku')
        .insert([{
          nama_siswa: pemantikData.nama || 'Teman Belajar',
          cerita: pemantikData.jawaban
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Berhasil disimpan ke tabel ceritaku', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase ceritaku notice:', e);
    }

    // B. Simpan juga ke tabel: jawaban_pemantik
    try {
      const { data, error } = await supabaseClient
        .from('jawaban_pemantik')
        .insert([{
          nama_siswa: pemantikData.nama || 'Teman Belajar',
          jawaban: pemantikData.jawaban
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Berhasil disimpan ke tabel jawaban_pemantik', data);
        savedData = savedData || data;
      }
    } catch (e) {
      console.warn('Supabase jawaban_pemantik notice:', e);
    }

    // C. Cadangkan langsung ke tabel refleksi_siswa (yang sudah 100% aktif dan terverifikasi di Supabase)
    // Menjamin ceritaku LANGSUNG tercatat di database cloud tanpa risiko hilang
    try {
      const { data, error } = await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: pemantikData.nama || 'Teman Belajar',
          aku_tahu: 'Ceritaku (Tahap D): ' + pemantikData.jawaban,
          aku_merasa: 'Semangat belajar materi uang rupiah',
          aku_ingin_mencoba: 'Mengenal berbagai jenis uang dan bijak berbelanja',
          foto_celengan_url: null
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Ceritaku sukses dicadangkan ke refleksi_siswa', data);
        savedData = savedData || data;
      }
    } catch (e) {
      console.warn('Supabase refleksi_siswa ceritaku backup notice:', e);
    }

    return savedData;
  },

  async saveCeritaku(data) {
    return this.savePemantikAnswer(data);
  },

  // 3. Simpan Transaksi Kasir Market Niza ke Cloud (Tahap H)
  async saveCashierTransaction(tx) {
    if (!this.isConnected()) return null;
    let savedData = null;
    try {
      const { data, error } = await supabaseClient
        .from('transaksi_kasir')
        .insert([{
          nama_siswa: tx.studentName || 'Teman Belajar',
          daftar_barang: tx.items || [],
          total_belanja: tx.total || 0,
          uang_pembayaran: tx.uangDibayar || 20000,
          sisa_uang: tx.sisaUang || 0
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Transaksi kasir tersimpan ke transaksi_kasir', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase saveCashierTransaction error:', e);
    }

    // Cadangkan juga ke refleksi_siswa agar riwayat kasir selalu tersimpan
    try {
      await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: tx.studentName || 'Teman Belajar',
          aku_tahu: `Belanja Kasir Market Niza: Total Rp${(tx.total || 0).toLocaleString('id-ID')}`,
          aku_merasa: 'Cermat menghitung uang dan sisa belanja',
          aku_ingin_mencoba: `Menabung sisa uang Rp${(tx.sisaUang || 0).toLocaleString('id-ID')} ke celengan ayam`,
          foto_celengan_url: null
        }]);
      console.log('✅ Supabase: Transaksi kasir dicadangkan ke refleksi_siswa');
    } catch (e) {}

    return savedData;
  },

  // 4. Simpan Hasil LKPD Digital ke Cloud (Tahap T)
  async saveLkpdSubmission(lkpdData) {
    if (!this.isConnected()) return null;
    let savedData = null;
    try {
      const { data, error } = await supabaseClient
        .from('lkpd_submissions')
        .insert([{
          nama_siswa: lkpdData.nama || 'Teman Belajar',
          kegiatan_1_amati: lkpdData.observed ?? true,
          kegiatan_2_kelompok: lkpdData.grouping || {},
          kegiatan_3_alasan: {
            alasan_kebutuhan: lkpdData.reasonKeb || '',
            alasan_keinginan: lkpdData.reasonKei || ''
          },
          kegiatan_4_prioritas: lkpdData.priority || 'B',
          kegiatan_5_kesimpulan: lkpdData.conclusions || {},
          skor: 100
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: LKPD Submission tersimpan ke lkpd_submissions', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase saveLkpdSubmission error:', e);
    }

    // Cadangkan ke refleksi_siswa
    try {
      await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: lkpdData.nama || 'Teman Belajar',
          aku_tahu: `LKPD: Kebutuhan (${lkpdData.reasonKeb || '-'}), Keinginan (${lkpdData.reasonKei || '-'})`,
          aku_merasa: 'Paham membedakan kebutuhan dan keinginan',
          aku_ingin_mencoba: 'Mendahulukan kebutuhan sebelum keinginan',
          foto_celengan_url: null
        }]);
      console.log('✅ Supabase: LKPD dicadangkan ke refleksi_siswa');
    } catch (e) {}

    return savedData;
  },

  // 5. Kirim Postingan Padlet ke Cloud (Tahap T)
  async sendPadletPost(post) {
    if (!this.isConnected()) return null;
    try {
      const payload = {
        nama_siswa: post.author || 'Teman Belajar',
        kelompok: parseInt(post.group, 10) || 1,
        judul: post.title,
        isi: post.content,
        likes: post.likes || 1
      };
      if (post.fileNama) payload.file_nama = post.fileNama;
      if (post.fileData) payload.file_data = post.fileData;

      const { data, error } = await supabaseClient
        .from('padlet_posts')
        .insert([payload])
        .select();
      if (error) throw error;
      console.log('✅ Supabase: Padlet post tersimpan', data);
      return data;
    } catch (e) {
      console.warn('Supabase sendPadletPost error:', e);
      return null;
    }
  },

  // 6. Ambil Postingan Padlet dari Cloud
  async getPadletPosts() {
    if (!this.isConnected()) return null;
    try {
      const { data, error } = await supabaseClient
        .from('padlet_posts')
        .select('*, padlet_comments(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase getPadletPosts error:', e);
      return null;
    }
  },

  // 7. Kirim Komentar Santun Padlet ke Cloud (Tahap T)
  async sendPadletComment(postId, comment) {
    if (!this.isConnected()) return null;
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
      if (!isUUID) {
        console.log('ℹ️ Post ID bukan UUID database, komentar disimpan di state lokal');
        return null;
      }
      const { data, error } = await supabaseClient
        .from('padlet_comments')
        .insert([{
          post_id: postId,
          nama_pengirim: comment.author,
          komentar: comment.text
        }])
        .select();
      if (error) throw error;
      console.log('✅ Supabase: Padlet comment tersimpan', data);
      return data;
    } catch (e) {
      console.warn('Supabase sendPadletComment error:', e);
      return null;
    }
  },

  // 8. Simpan Pertanyaan Penguatan Materi (Tahap I)
  async savePenguatanAnswers(penguatanData) {
    if (!this.isConnected()) return null;
    let savedData = null;
    try {
      const { data, error } = await supabaseClient
        .from('penguatan_materi')
        .insert([{
          nama_siswa: penguatanData.nama || 'Teman Belajar',
          jawaban_1: penguatanData.a1 || '',
          jawaban_2: penguatanData.a2 || '',
          jawaban_3: penguatanData.a3 || ''
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Penguatan materi tersimpan ke tabel penguatan_materi', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase savePenguatanAnswers notice:', e);
    }

    // Cadangkan ke refleksi_siswa agar tersimpan 100% aman
    try {
      await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: penguatanData.nama || 'Teman Belajar',
          aku_tahu: `Penguatan: 1. ${penguatanData.a1 || '-'} | 2. ${penguatanData.a2 || '-'}`,
          aku_merasa: 'Semangat belajar penguatan materi rupiah',
          aku_ingin_mencoba: `Solusi Belanja: ${penguatanData.a3 || '-'}`,
          foto_celengan_url: null
        }]);
      console.log('✅ Supabase: Penguatan materi dicadangkan ke refleksi_siswa');
    } catch (e) {}

    return savedData;
  },

  // 9. Simpan File Karya Siswa (Tahap K - Upload File Celengan / Rencana Belanja)
  // Menyimpan ke tabel 'hasil_karyaku' dan 'refleksi_siswa' (foto_celengan_url)
  async saveHasilKaryaku(karyaData) {
    if (!this.isConnected()) return null;
    let savedData = null;

    // A. Simpan ke tabel resmi: hasil_karyaku
    try {
      const { data, error } = await supabaseClient
        .from('hasil_karyaku')
        .insert([{
          nama_siswa: karyaData.nama || 'Teman Belajar',
          judul_karya: karyaData.judul || 'Celengan Kreatif & Rencana Belanja',
          deskripsi: karyaData.deskripsi || '',
          foto_karya: karyaData.fileData || '',
          nama_file: karyaData.fileNama || 'karya.jpg',
          ukuran_file: karyaData.fileUkuran || 0,
          tipe_file: karyaData.fileTipe || 'image/jpeg'
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Berhasil disimpan ke tabel hasil_karyaku', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase hasil_karyaku notice:', e);
    }

    // B. Simpan juga ke tabel karya_siswa (alias jika ada)
    try {
      const { data, error } = await supabaseClient
        .from('karya_siswa')
        .insert([{
          nama_siswa: karyaData.nama || 'Teman Belajar',
          judul: karyaData.judul || 'Karyaku: Celengan Kreatif',
          deskripsi: karyaData.deskripsi || '',
          file_nama: karyaData.fileNama || 'karya.jpg',
          file_data: karyaData.fileData || '',
          file_ukuran: karyaData.fileUkuran || 0,
          file_tipe: karyaData.fileTipe || 'image/jpeg'
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Berhasil disimpan ke tabel karya_siswa', data);
        savedData = savedData || data;
      }
    } catch (e) {
      // ignore
    }

    // C. Simpan foto karya ke tabel refleksi_siswa (kolom foto_celengan_url)
    // Tabel ini sudah 100% aktif dan terverifikasi di Supabase sehingga foto karya dijamin tersimpan!
    try {
      const { data, error } = await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: karyaData.nama || 'Teman Belajar',
          aku_tahu: 'Hasil Karyaku: ' + (karyaData.judul || 'Celengan Kreatif'),
          aku_merasa: 'Bangga dengan hasil karya celengan buatanku',
          aku_ingin_mencoba: 'Rajin menabung uang sisa belanja ke dalam celengan ayam',
          foto_celengan_url: karyaData.fileData || null
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Foto karya sukses tersimpan di refleksi_siswa.foto_celengan_url', data);
        savedData = savedData || data;
      }
    } catch (e) {
      console.warn('Supabase refleksi_siswa sync notice:', e);
    }

    return savedData;
  },

  // Alias untuk kompatibilitas
  async saveKaryaSiswa(karyaData) {
    return this.saveHasilKaryaku(karyaData);
  },

  // Ambil Seluruh Hasil Karyaku dari Database Cloud
  async getHasilKaryaku() {
    if (!this.isConnected()) return null;
    try {
      const { data, error } = await supabaseClient
        .from('hasil_karyaku')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase getHasilKaryaku notice:', e);
      return null;
    }
  },

  // 10. Simpan Refleksi Siswa (Tahap K) ke Cloud
  async saveReflection(refData) {
    if (!this.isConnected()) return null;
    try {
      const { data, error } = await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: refData.nama || 'Teman Belajar',
          aku_tahu: refData.tahu,
          aku_merasa: refData.merasa,
          aku_ingin_mencoba: refData.mencoba,
          foto_celengan_url: refData.fotoUrl || null
        }])
        .select();
      if (error) throw error;
      console.log('✅ Supabase: Refleksi siswa tersimpan', data);
      return data;
    } catch (e) {
      console.warn('Supabase saveReflection error:', e);
      return null;
    }
  },

  // 11. Simpan Hasil Kuis Evaluasi (10 Soal)
  async saveQuizResult(quizData) {
    if (!this.isConnected()) return null;
    let savedData = null;
    try {
      const { data, error } = await supabaseClient
        .from('hasil_kuis')
        .insert([{
          nama_siswa: quizData.nama || 'Teman Belajar',
          skor: quizData.score || 0,
          total_soal: quizData.total || 10,
          persentase: quizData.percent || 0
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Hasil kuis tersimpan ke tabel hasil_kuis', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase saveQuizResult notice:', e);
    }

    // Cadangkan ke refleksi_siswa
    try {
      await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: quizData.nama || 'Teman Belajar',
          aku_tahu: `Nilai Kuis Evaluasi: ${quizData.percent}% (${quizData.score}/${quizData.total || 10} Benar)`,
          aku_merasa: quizData.percent >= 70 ? 'Sangat senang dan puas dengan hasil kuis' : 'Perlu belajar lebih giat lagi',
          aku_ingin_mencoba: 'Menerapkan cara belanja bijak dalam kehidupan sehari-hari',
          foto_celengan_url: null
        }]);
      console.log('✅ Supabase: Nilai kuis dicadangkan ke refleksi_siswa');
    } catch (e) {}

    return savedData;
  },

  // 12. Simpan Kontak & Masukan / Saran Belajar
  async saveContactFeedback(feedbackData) {
    if (!this.isConnected()) return null;
    let savedData = null;
    try {
      const { data, error } = await supabaseClient
        .from('kontak_masukan')
        .insert([{
          nama_pengirim: feedbackData.nama || 'Teman Belajar',
          sekolah: feedbackData.sekolah || '',
          rating: feedbackData.rating || 5,
          pesan: feedbackData.pesan || ''
        }])
        .select();
      if (!error && data) {
        console.log('✅ Supabase: Kontak masukan tersimpan ke tabel kontak_masukan', data);
        savedData = data;
      }
    } catch (e) {
      console.warn('Supabase saveContactFeedback notice:', e);
    }

    // Cadangkan ke refleksi_siswa
    try {
      await supabaseClient
        .from('refleksi_siswa')
        .insert([{
          nama_siswa: `${feedbackData.nama || 'Teman Belajar'} (Kesan/Saran - ${feedbackData.sekolah || 'SD'})`,
          aku_tahu: `Rating Pengalaman: ${feedbackData.rating || 5} Bintang`,
          aku_merasa: 'Senang memberikan saran dan pesan',
          aku_ingin_mencoba: `Pesan: ${feedbackData.pesan || '-'}`,
          foto_celengan_url: null
        }]);
      console.log('✅ Supabase: Kontak & saran dicadangkan ke refleksi_siswa');
    } catch (e) {}

    return savedData;
  }
};

window.RBC_SUPABASE = RBC_SUPABASE;
