-- ============================================================
-- SQL UNTUK TABEL TAMBAHAN DI SUPABASE
-- Jalankan ini di Supabase SQL Editor:
-- Project: design think -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- 1. Tabel Penguatan Materi (Tahap I)
CREATE TABLE IF NOT EXISTS penguatan_materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    jawaban_1 TEXT NOT NULL,
    jawaban_2 TEXT NOT NULL,
    jawaban_3 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Hasil Kuis Evaluasi (10 Soal)
CREATE TABLE IF NOT EXISTS hasil_kuis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    skor INT NOT NULL,
    total_soal INT DEFAULT 10,
    persentase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Kontak & Masukan
CREATE TABLE IF NOT EXISTS kontak_masukan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pengirim TEXT NOT NULL,
    sekolah TEXT,
    rating INT DEFAULT 5,
    pesan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Alias Tabel karya_siswa
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

-- Berikan izin akses publik (anon & authenticated)
GRANT ALL ON TABLE penguatan_materi TO anon, authenticated;
GRANT ALL ON TABLE hasil_kuis TO anon, authenticated;
GRANT ALL ON TABLE kontak_masukan TO anon, authenticated;
GRANT ALL ON TABLE karya_siswa TO anon, authenticated;

-- Aktifkan Row Level Security (RLS)
ALTER TABLE penguatan_materi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik penguatan_materi" ON penguatan_materi;
CREATE POLICY "Akses publik penguatan_materi" ON penguatan_materi FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE hasil_kuis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_kuis" ON hasil_kuis;
CREATE POLICY "Akses publik hasil_kuis" ON hasil_kuis FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE kontak_masukan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik kontak_masukan" ON kontak_masukan;
CREATE POLICY "Akses publik kontak_masukan" ON kontak_masukan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE karya_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik karya_siswa" ON karya_siswa;
CREATE POLICY "Akses publik karya_siswa" ON karya_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

