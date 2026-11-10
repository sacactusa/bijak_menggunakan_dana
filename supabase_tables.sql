-- ============================================================
-- RUANG BELAJAR CERIA - DATABASE SCHEMA UNTUK SELURUH FORM
-- Jalankan skrip SQL ini di Supabase SQL Editor:
-- Dashboard Supabase -> Project: design think -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Tabel Siswa & Poin (Sudah Ada / Update jika belum)
CREATE TABLE IF NOT EXISTS siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_panggilan TEXT NOT NULL,
    poin INT DEFAULT 25,
    bintang INT DEFAULT 8,
    progres_tahap JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Pertanyaan Pemantik (Tahap D)
CREATE TABLE IF NOT EXISTS jawaban_pemantik (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    jawaban TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Transaksi Kasir & Sisa Belanja (Tahap H)
CREATE TABLE IF NOT EXISTS transaksi_kasir (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    daftar_barang JSONB,
    total_belanja INT,
    uang_pembayaran INT,
    sisa_uang INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel LKPD Digital 5 Kegiatan (Tahap T)
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

-- 5. Tabel Papan Padlet Diskusi (Tahap T)
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

-- 7. Tabel Jawaban Penguatan Materi (Tahap I)
CREATE TABLE IF NOT EXISTS penguatan_materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    jawaban_1 TEXT NOT NULL,
    jawaban_2 TEXT NOT NULL,
    jawaban_3 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Hasil Karyaku (Tahap K - Upload Foto Celengan & Rencana Belanja)
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

-- Alias tabel karya_siswa untuk kompatibilitas
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

-- 9. Tabel Refleksi Mandiri 3 Kalimat Emas (Tahap K)
CREATE TABLE IF NOT EXISTS refleksi_siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    aku_tahu TEXT NOT NULL,
    aku_merasa TEXT NOT NULL,
    aku_ingin_mencoba TEXT NOT NULL,
    foto_celengan_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Hasil Kuis Evaluasi (Kuis 10 Soal)
CREATE TABLE IF NOT EXISTS hasil_kuis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    skor INT NOT NULL,
    total_soal INT DEFAULT 10,
    persentase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Kontak, Saran & Masukan (Halaman Kontak)
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

-- Default privileges untuk tabel baru
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- ============================================================
-- 1. Siswa
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik siswa" ON siswa;
CREATE POLICY "Akses publik siswa" ON siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Jawaban Pemantik
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

-- 8. Hasil Karyaku & Karya Siswa (Upload File)
ALTER TABLE hasil_karyaku ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_karyaku" ON hasil_karyaku;
CREATE POLICY "Akses publik hasil_karyaku" ON hasil_karyaku FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE karya_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik karya_siswa" ON karya_siswa;
CREATE POLICY "Akses publik karya_siswa" ON karya_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. Refleksi Siswa
ALTER TABLE refleksi_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik refleksi_siswa" ON refleksi_siswa;
CREATE POLICY "Akses publik refleksi_siswa" ON refleksi_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 10. Hasil Kuis
ALTER TABLE hasil_kuis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_kuis" ON hasil_kuis;
CREATE POLICY "Akses publik hasil_kuis" ON hasil_kuis FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 11. Kontak Masukan
ALTER TABLE kontak_masukan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik kontak_masukan" ON kontak_masukan;
CREATE POLICY "Akses publik kontak_masukan" ON kontak_masukan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

