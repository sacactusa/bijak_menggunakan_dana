-- ============================================================
-- SQL REVISI TERBARU - TABEL KHUSUS FITUR BARU DI SUPABASE
-- Gunakan ini jika 13 tabel sebelumnya sudah ada dan Anda hanya 
-- ingin menambahkan 3 tabel fitur revisi terbaru:
-- 1. diskusi_bersama (Diskusi di bawah Kesimpulan Bersama)
-- 2. hasil_game (Skor 5 Jenis Game Edukasi x 10 Soal)
-- 3. sertifikat_siswa (Sertifikat Siswa 3 Tema Varian)
-- ============================================================

-- 1. Tabel Ruang Diskusi Bersama (Tahap I - Di Bawah Kesimpulan Bersama)
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

-- Pastikan kolom komentar tersedia jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE diskusi_bersama ADD COLUMN IF NOT EXISTS komentar JSONB DEFAULT '[]'::jsonb;

-- 2. Tabel Hasil Game Edukasi (5 Jenis Game x 10 Soal Lengkap)
CREATE TABLE IF NOT EXISTS hasil_game (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    game_tipe TEXT NOT NULL,
    skor INT NOT NULL,
    total_soal INT DEFAULT 10,
    persentase INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Sertifikat Siswa (Tahap K - 3 Tema Desain: Biru, Merah, Emas)
CREATE TABLE IF NOT EXISTS sertifikat_siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_siswa TEXT NOT NULL,
    predikat TEXT DEFAULT 'ANAK HEBAT BIJAK BERBELANJA',
    seri_tema TEXT DEFAULT 'biru',
    tanggal_terbit DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Berikan izin akses publik (anon & authenticated)
GRANT ALL ON TABLE diskusi_bersama, hasil_game, sertifikat_siswa TO anon, authenticated;

-- Index performa
CREATE INDEX IF NOT EXISTS idx_diskusi_bersama_created_at ON diskusi_bersama (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hasil_game_nama ON hasil_game (nama_siswa);
CREATE INDEX IF NOT EXISTS idx_hasil_game_created_at ON hasil_game (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sertifikat_siswa_nama ON sertifikat_siswa (nama_siswa);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE diskusi_bersama ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik diskusi_bersama" ON diskusi_bersama;
CREATE POLICY "Akses publik diskusi_bersama" ON diskusi_bersama FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE hasil_game ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik hasil_game" ON hasil_game;
CREATE POLICY "Akses publik hasil_game" ON hasil_game FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE sertifikat_siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses publik sertifikat_siswa" ON sertifikat_siswa;
CREATE POLICY "Akses publik sertifikat_siswa" ON sertifikat_siswa FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
