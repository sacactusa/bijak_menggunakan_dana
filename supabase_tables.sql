-- ============================================================
-- RUANG BELAJAR CERIA - DATABASE SCHEMA SUPABASE LENGKAP
-- Sesuai dengan Seluruh Fitur & Revisi Web Terbaru (Model DHETIK)
-- Jalankan skrip SQL ini di Supabase SQL Editor:
-- Dashboard Supabase -> Project: design think -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Tabel Siswa & Poin (Tahap Registrasi & Profil)
CREATE TABLE IF NOT EXISTS siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_panggilan TEXT NOT NULL,
    poin INT DEFAULT 25,
    bintang INT DEFAULT 8,
    progres_tahap JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Ceritaku & Jawaban Pemantik (Tahap D - Definisi & Empati)
CREATE TABLE IF NOT EXISTS ceritaku (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    cerita TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jawaban_pemantik (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    jawaban TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Transaksi Kasir & Sisa Belanja (Tahap H - Eksplorasi Kasir Market Niza)
CREATE TABLE IF NOT EXISTS transaksi_kasir (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    daftar_barang JSONB,
    total_belanja INT,
    uang_pembayaran INT,
    sisa_uang INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel LKPD Digital 5 Kegiatan (Tahap T - Telaah & Klasifikasi)
CREATE TABLE IF NOT EXISTS lkpd_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    kegiatan_1_amati BOOLEAN DEFAULT true,
    kegiatan_2_kelompok JSONB,
    kegiatan_3_alasan JSONB,
    kegiatan_4_prioritas TEXT,
    kegiatan_5_kesimpulan JSONB,
    skor INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Papan Padlet Diskusi (Tahap T - Diskusi Kelompok)
CREATE TABLE IF NOT EXISTS padlet_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    kelompok INT NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    likes INT DEFAULT 1,
    file_nama TEXT,
    file_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambah kolom file jika tabel sudah ada sebelumnya
ALTER TABLE padlet_posts ADD COLUMN IF NOT EXISTS file_nama TEXT;
ALTER TABLE padlet_posts ADD COLUMN IF NOT EXISTS file_data TEXT;

-- 6. Tabel Komentar Diskusi Santun Padlet (Tahap T)
CREATE TABLE IF NOT EXISTS padlet_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES padlet_posts(id) ON DELETE CASCADE,
    nama_pengirim TEXT NOT NULL,
    komentar TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Jawaban Penguatan Materi (Tahap I - Ikat Konsep)
CREATE TABLE IF NOT EXISTS penguatan_materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    jawaban_1 TEXT NOT NULL,
    jawaban_2 TEXT NOT NULL,
    jawaban_3 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. [REVISI TERBARU] Tabel Ruang Diskusi Bersama (Tahap I - Di Bawah Kesimpulan Bersama)
CREATE TABLE IF NOT EXISTS diskusi_bersama (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    role TEXT DEFAULT 'Siswa Kelas 3 SD',
    opini TEXT NOT NULL,
    kategori TEXT DEFAULT '💰 Belanja Bijak',
    likes INT DEFAULT 1,
    komentar JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom komentar tersedia jika tabel sudah ada sebelumnya
ALTER TABLE diskusi_bersama ADD COLUMN IF NOT EXISTS komentar JSONB DEFAULT '[]'::jsonb;

-- 9. Tabel Hasil Karyaku (Tahap K - Upload Foto Celengan & Rencana Belanja)
CREATE TABLE IF NOT EXISTS hasil_karyaku (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    judul_karya TEXT DEFAULT 'Celengan Kreatif & Rencana Belanja',
    deskripsi TEXT,
    foto_karya TEXT,
    nama_file TEXT,
    ukuran_file INT,
    tipe_file TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias tabel karya_siswa untuk kompatibilitas form upload
CREATE TABLE IF NOT EXISTS karya_siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    judul TEXT DEFAULT 'Karyaku: Celengan Kreatif',
    deskripsi TEXT,
    file_nama TEXT,
    file_data TEXT,
    file_ukuran INT,
    file_tipe TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Refleksi Mandiri 3 Kalimat Emas & Cadangan Cloud (Tahap K)
CREATE TABLE IF NOT EXISTS refleksi_siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    aku_tahu TEXT NOT NULL,
    aku_merasa TEXT NOT NULL,
    aku_ingin_mencoba TEXT NOT NULL,
    foto_celengan_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. [REVISI TERBARU] Tabel Sertifikat Siswa (Tahap K - 3 Tema Desain: Biru, Merah, Emas)
CREATE TABLE IF NOT EXISTS sertifikat_siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    predikat TEXT DEFAULT 'ANAK HEBAT BIJAK BERBELANJA',
    seri_tema TEXT DEFAULT 'biru',
    tanggal_terbit DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabel Hasil Kuis Evaluasi (Kuis 10 Soal Pemahaman Finansial)
CREATE TABLE IF NOT EXISTS hasil_kuis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    skor INT NOT NULL,
    total_soal INT DEFAULT 10,
    persentase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. [REVISI TERBARU] Tabel Hasil Game Edukasi (5 Jenis Game x 10 Soal Lengkap)
-- Game: tebak (Tebak Uang Asli), susun (Susun Kata), matematika (Matematika Belanja), 
--       pasang (Pasangkan Kebutuhan/Keinginan), benarsalah (Benar / Salah)
CREATE TABLE IF NOT EXISTS hasil_game (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    game_tipe TEXT NOT NULL,
    skor INT NOT NULL,
    total_soal INT DEFAULT 10,
    persentase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tabel Kontak, Saran & Masukan (Halaman Kontak)
CREATE TABLE IF NOT EXISTS kontak_masukan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pengirim TEXT NOT NULL,
    sekolah TEXT,
    rating INT DEFAULT 5,
    pesan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HAK AKSES PERMISSION (GRANT) UNTUK ROLE ANON & AUTHENTICATED
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Berikan izin eksplisit untuk seluruh tabel aplikasi (termasuk tabel revisi terbaru)
GRANT ALL ON TABLE 
    siswa, 
    ceritaku, 
    jawaban_pemantik, 
    transaksi_kasir, 
    lkpd_submissions, 
    padlet_posts, 
    padlet_comments, 
    penguatan_materi, 
    diskusi_bersama,
    hasil_karyaku, 
    karya_siswa, 
    refleksi_siswa, 
    sertifikat_siswa,
    hasil_kuis, 
    hasil_game,
    kontak_masukan 
TO anon, authenticated;

-- Default privileges untuk tabel baru
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ============================================================
-- INDEX PERFORMA UNTUK PENCARIAN & RELASI CEPAT (POSTGRES BEST PRACTICES)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_siswa_nama ON siswa (nama_panggilan);
CREATE INDEX IF NOT EXISTS idx_padlet_comments_post_id ON padlet_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_padlet_posts_created_at ON padlet_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diskusi_bersama_created_at ON diskusi_bersama (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hasil_karyaku_created_at ON hasil_karyaku (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refleksi_siswa_created_at ON refleksi_siswa (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hasil_game_nama ON hasil_game (nama_siswa);
CREATE INDEX IF NOT EXISTS idx_hasil_game_created_at ON hasil_game (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sertifikat_siswa_nama ON sertifikat_siswa (nama_siswa);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES PUBLIK
-- ============================================================
-- 1. Siswa
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik siswa" ON siswa;
CREATE POLICY "Akses publik siswa" ON siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Ceritaku & Jawaban Pemantik
ALTER TABLE ceritaku ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik ceritaku" ON ceritaku;
CREATE POLICY "Akses publik ceritaku" ON ceritaku FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE jawaban_pemantik ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik jawaban_pemantik" ON jawaban_pemantik;
CREATE POLICY "Akses publik jawaban_pemantik" ON jawaban_pemantik FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Transaksi Kasir
ALTER TABLE transaksi_kasir ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik transaksi_kasir" ON transaksi_kasir;
CREATE POLICY "Akses publik transaksi_kasir" ON transaksi_kasir FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. LKPD Submissions
ALTER TABLE lkpd_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik lkpd_submissions" ON lkpd_submissions;
CREATE POLICY "Akses publik lkpd_submissions" ON lkpd_submissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Padlet Posts
ALTER TABLE padlet_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik padlet_posts" ON padlet_posts;
CREATE POLICY "Akses publik padlet_posts" ON padlet_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. Padlet Comments
ALTER TABLE padlet_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik padlet_comments" ON padlet_comments;
CREATE POLICY "Akses publik padlet_comments" ON padlet_comments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. Penguatan Materi
ALTER TABLE penguatan_materi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik penguatan_materi" ON penguatan_materi;
CREATE POLICY "Akses publik penguatan_materi" ON penguatan_materi FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. Diskusi Bersama (Revisi Tahap I)
ALTER TABLE diskusi_bersama ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik diskusi_bersama" ON diskusi_bersama;
CREATE POLICY "Akses publik diskusi_bersama" ON diskusi_bersama FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. Hasil Karyaku & Karya Siswa (Upload File)
ALTER TABLE hasil_karyaku ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_karyaku" ON hasil_karyaku;
CREATE POLICY "Akses publik hasil_karyaku" ON hasil_karyaku FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE karya_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik karya_siswa" ON karya_siswa;
CREATE POLICY "Akses publik karya_siswa" ON karya_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 10. Refleksi Siswa
ALTER TABLE refleksi_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik refleksi_siswa" ON refleksi_siswa;
CREATE POLICY "Akses publik refleksi_siswa" ON refleksi_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 11. Sertifikat Siswa (Revisi Sertifikat)
ALTER TABLE sertifikat_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik sertifikat_siswa" ON sertifikat_siswa;
CREATE POLICY "Akses publik sertifikat_siswa" ON sertifikat_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 12. Hasil Kuis Evaluasi
ALTER TABLE hasil_kuis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_kuis" ON hasil_kuis;
CREATE POLICY "Akses publik hasil_kuis" ON hasil_kuis FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 13. Hasil Game Edukasi (Revisi Game Edukasi)
ALTER TABLE hasil_game ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_game" ON hasil_game;
CREATE POLICY "Akses publik hasil_game" ON hasil_game FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 14. Kontak Masukan
ALTER TABLE kontak_masukan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik kontak_masukan" ON kontak_masukan;
CREATE POLICY "Akses publik kontak_masukan" ON kontak_masukan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
