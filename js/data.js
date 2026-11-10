/**
 * Ruang Belajar Ceria - Master Data Store
 * IPAS Kelas 3 SD / Fase B - Bab 5: Bijak Berbelanja Kebutuhan
 */
const RBC_DATA = {
  appInfo: {
    title: "Ruang Belajar Ceria",
    subtitle: "Media Pembelajaran Digital Interaktif Berbasis Model DHETIK",
    grade: "Kelas 3 SD / Fase B",
    subject: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    topic: "Bab 5: Bijak Berbelanja Kebutuhan",
    institution: "Universitas Pendidikan Indonesia - Kampus UPI di Cibiru",
    program: "PGSD UPI CIBIRU 2026 (#dHeTik)",
    developers: [
      "Ines Khairunisa",
      "Nasrun Nurhakim",
      "Nur Afifah Handayani",
      "Zidna Syifanadia Impian Pragita Mariannisa"
    ],
    canvaUrl: "https://canva.link/e0arf658n2yoz1b",
    closingTagline: "Belajar Jadi Lebih Seru, Belanja Jadi Lebih Bijak!",
    closingSubtitle: "Ruang Belajar Ceria – Teman Belajar, Petualangan Menyenangkan!"
  },

  learningObjective: {
    cp: "Peserta didik mampu menjelaskan nilai mata uang dan fungsinya, serta cara mengelola keuangan secara bijak.",
    indicators: [
      "Mengenal berbagai pecahan uang rupiah kertas dan uang logam beserta nilai nominalnya.",
      "Mengidentifikasi fungsi uang sebagai alat tukar dan alat pembayaran dalam kehidupan sehari-hari.",
      "Membedakan antara kebutuhan dan keinginan dalam kegiatan berbelanja.",
      "Menerapkan cara mengelola uang saku secara bijak melalui perencanaan belanja dan kebiasaan menabung."
    ]
  },

  dhetikStages: [
    {
      id: "d",
      code: "D",
      name: "Dekatkan",
      label: "Ayo Mulai",
      icon: "sparkles",
      color: "sky",
      badgeColor: "bg-sky-100 text-sky-700 border-sky-300",
      desc: "Mengenal uang rupiah dan mengingat pengalaman menggunakan uang sehari-hari."
    },
    {
      id: "h",
      code: "H",
      name: "Hubungkan",
      label: "Hubungkan dengan Hidupku",
      icon: "link",
      color: "emerald",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-300",
      desc: "Menghubungkan fungsi uang dan membedakan kebutuhan serta keinginan."
    },
    {
      id: "e",
      code: "E",
      name: "Eksplorasi",
      label: "Ayo Menjelajah",
      icon: "shopping-bag",
      color: "amber",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-300",
      desc: "Mengeksplorasi pecahan uang dan bermain simulasi Market Niza."
    },
    {
      id: "t",
      code: "T",
      name: "Tukar Gagasan",
      label: "Ruang Diskusi",
      icon: "messages-square",
      color: "violet",
      badgeColor: "bg-violet-100 text-violet-700 border-violet-300",
      desc: "Berbagi pendapat dan saling menanggapi dengan bahasa santun."
    },
    {
      id: "i",
      code: "I",
      name: "Ikat Konsep",
      label: "Ikat Ilmuku",
      icon: "lightbulb",
      color: "rose",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-300",
      desc: "Menyimpulkan materi, meluruskan miskonsepsi, dan mengikat pemahaman."
    },
    {
      id: "k",
      code: "K",
      name: "Karya & Refleksi",
      label: "Karyaku",
      icon: "palette",
      color: "indigo",
      badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-300",
      desc: "Membuat celengan kreatif, rencana belanja, dan refleksi belajar."
    }
  ],

  // Data Uang Rupiah (Flashcards)
  rupiahCoins: [
    { value: 100, label: "Rp100", name: "Seratus Rupiah", type: "logam", material: "Aluminium", color: "#94a3b8", desc: "Koin aluminium bergambar Burung Kakaktua Raja." },
    { value: 200, label: "Rp200", name: "Dua Ratus Rupiah", type: "logam", material: "Aluminium", color: "#94a3b8", desc: "Koin aluminium bergambar Burung Jalak Bali." },
    { value: 500, label: "Rp500", name: "Lima Ratus Rupiah", type: "logam", material: "Aluminium", color: "#cbd5e1", desc: "Koin aluminium bergambar Bunga Melati / Letjen TNI T.B. Simatupang." },
    { value: 1000, label: "Rp1.000", name: "Seribu Rupiah Logam", type: "logam", material: "Nikel/Baja", color: "#e2e8f0", desc: "Koin logam bergambar pahlawan Mr. I Gusti Ketut Pudja." }
  ],

  rupiahBanknotes: [
    { value: 1000, label: "Rp1.000", name: "Seribu Rupiah Kertas", type: "kertas", hero: "Tjut Meutia", color: "#fef08a", bgStyle: "bg-yellow-100 border-yellow-300 text-yellow-800", desc: "Berwarna kuning kehijauan cerah dengan gambar pahlawan Tjut Meutia." },
    { value: 2000, label: "Rp2.000", name: "Dua Ribu Rupiah", type: "kertas", hero: "Mohammad Hoesni Thamrin", color: "#cbd5e1", bgStyle: "bg-slate-100 border-slate-300 text-slate-800", desc: "Berwarna abu-abu keperakan dengan gambar pahlawan M.H. Thamrin." },
    { value: 5000, label: "Rp5.000", name: "Lima Ribu Rupiah", type: "kertas", hero: "Dr. K.H. Idham Chalid", color: "#fed7aa", bgStyle: "bg-orange-100 border-orange-300 text-orange-800", desc: "Berwarna cokelat keemasan dengan gambar pahlawan Dr. K.H. Idham Chalid." },
    { value: 10000, label: "Rp10.000", name: "Sepuluh Ribu Rupiah", type: "kertas", hero: "Frans Kaisiepo", color: "#e9d5ff", bgStyle: "bg-purple-100 border-purple-300 text-purple-800", desc: "Berwarna ungu cerah dengan gambar pahlawan nasional dari Papua, Frans Kaisiepo." },
    { value: 20000, label: "Rp20.000", name: "Dua Puluh Ribu Rupiah", type: "kertas", hero: "Dr. G.S.S.J. Ratulangi", color: "#bbf7d0", bgStyle: "bg-emerald-100 border-emerald-300 text-emerald-800", desc: "Berwarna hijau segar dengan gambar pahlawan Dr. G.S.S.J. Ratulangi." },
    { value: 50000, label: "Rp50.000", name: "Lima Puluh Ribu Rupiah", type: "kertas", hero: "Ir. H. Djuanda Kartawidjaja", color: "#bae6fd", bgStyle: "bg-sky-100 border-sky-300 text-sky-800", desc: "Berwarna biru laut dengan gambar tokoh deklarasi Djuanda." },
    { value: 100000, label: "Rp100.000", name: "Seratus Ribu Rupiah", type: "kertas", hero: "Soekarno - Hatta", color: "#fecdd3", bgStyle: "bg-rose-100 border-rose-300 text-rose-800", desc: "Berwarna merah muda terang dengan gambar Proklamator Ir. Soekarno & Mohammad Hatta." }
  ],

  // Market Niza Store Goods
  marketNizaItems: [
    { id: "pencil", name: "Pensil 2B Lucu", price: 3000, category: "kebutuhan", icon: "✏️", desc: "Alat tulis untuk menulis dan mengerjakan tugas sekolah." },
    { id: "eraser", name: "Penghapus Karakter", price: 2000, category: "kebutuhan", icon: "🧼", desc: "Menghapus tulisan pensil yang salah dengan bersih." },
    { id: "notebook", name: "Buku Tulis Bergaris", price: 5000, category: "kebutuhan", icon: "📓", desc: "Buku catatan belajar agar pelajaran selalu tersimpan rapi." },
    { id: "rubik", name: "Rubik Puzzle Warna", price: 10000, category: "keinginan", icon: "🎲", desc: "Mainan asah otak warna-warni yang seru untuk waktu luang." },
    { id: "snack", name: "Ciki / Makanan Ringan", price: 3000, category: "keinginan", icon: "🍿", desc: "Camilan renyah yang enak disantap saat istirahat." },
    { id: "milk", name: "Susu Kotak Segar", price: 4000, category: "kebutuhan", icon: "🧃", desc: "Minuman bergizi kaya kalsium untuk pertumbuhan tubuh." },
    { id: "bread", name: "Roti Manis Cokelat", price: 5000, category: "kebutuhan", icon: "🍞", desc: "Makanan pengganjal perut saat lapar di jam istirahat." },
    { id: "slime", name: "Slime / Clay Warna", price: 7000, category: "keinginan", icon: "clayWarna", desc: "Mainan tanah liat berwarna untuk berkreasi membuat aneka bentuk." },
    { id: "sticker", name: "Stiker Kartun Lucu", price: 2000, category: "keinginan", icon: "⭐", desc: "Stiker hiasan untuk ditempel di buku atau tempat pensil." }
  ],

  // Videos Data
  videos: [
    {
      id: "vid-coin",
      title: "Mengenal Uang Koin / Logam Rupiah",
      category: "Tahap D - Dekatkan",
      youtubeId: "AmBTrtYAyTE",
      url: "https://youtu.be/AmBTrtYAyTE?si=dXDyn1cRC45DMW_d",
      duration: "4 Menit",
      desc: "Pelajari bentuk, bahan pembuat logam, serta berbagai pecahan koin Rupiah yang kita gunakan sehari-hari."
    },
    {
      id: "vid-paper",
      title: "Mengenal Pecahan Uang Kertas Rupiah",
      category: "Tahap D - Dekatkan",
      youtubeId: "KhmQWn390gw",
      url: "https://youtu.be/KhmQWn390gw?si=9VYVoYg8f_p31NiH",
      duration: "5 Menit",
      desc: "Menjelajahi keunikan uang kertas rupiah, warna-warni nominal, pahlawan nasional, dan ciri keasliannya."
    },
    {
      id: "vid-needs-wants",
      title: "Perbedaan Kebutuhan dan Keinginan saat Berbelanja",
      category: "Tahap H - Hubungkan",
      youtubeId: "BCrFOo2-pOA",
      url: "https://youtu.be/BCrFOo2-pOA?si=0qhhy7Ij32U975k_",
      duration: "6 Menit",
      desc: "Memahami mengapa kita harus mendahulukan barang kebutuhan sebelum membeli barang keinginan agar uang saku tidak cepat habis."
    },
    {
      id: "vid-local-anim",
      title: "Video Animasi Edukasi: Bijak Mengelola Uang",
      category: "Video Khusus",
      localFile: "assets/Video animasi uang.mp4",
      youtubeId: null,
      duration: "7 Menit",
      desc: "Video animasi seru dari media proyek sekolah yang menjelaskan perjalanan uang dari celengan hingga transaksi belanja bijak."
    }
  ],

  // 10 Kuis Interaktif Kelas 3 SD
  quizQuestions: [
    {
      id: 1,
      question: "Apakah fungsi utama uang rupiah dalam kegiatan sehari-hari di kantin sekolah?",
      options: [
        "Sebagai hiasan di dalam saku baju",
        "Sebagai alat tukar dan pembayaran yang sah",
        "Sebagai mainan untuk dilempar-lempar",
        "Sebagai bahan untuk membuat kertas gambar"
      ],
      correct: 1,
      explanation: "Uang berfungsi resmi sebagai alat tukar dan alat pembayaran sah untuk mendapatkan barang atau jasa yang kita butuhkan."
    },
    {
      id: 2,
      question: "Manakah di bawah ini yang merupakan contoh pecahan uang logam rupiah?",
      options: [
        "Rp10.000",
        "Rp50.000",
        "Rp500",
        "Rp2.000"
      ],
      correct: 2,
      explanation: "Rp500 adalah salah satu pecahan uang logam (koin) yang terbuat dari aluminium dan masih digunakan saat ini."
    },
    {
      id: 3,
      question: "Bima merasa sangat lapar di jam istirahat. Hal yang paling tepat dibeli Bima adalah...",
      options: [
        "Mobil mainan baru",
        "Roti atau makanan sehat pengganjal perut",
        "Stiker kartun untuk ditempel di meja",
        "Batu akik warna-warni"
      ],
      correct: 1,
      explanation: "Makanan sehat adalah kebutuhan pokok tubuh untuk bertahan hidup dan bertenaga saat belajar di sekolah."
    },
    {
      id: 4,
      question: "Apa perbedaan paling mendasar antara kebutuhan dan keinginan?",
      options: [
        "Kebutuhan harus dipenuhi agar kita hidup sehat dan baik, sedangkan keinginan boleh ditunda",
        "Kebutuhan harganya selalu murah, sedangkan keinginan selalu mahal",
        "Kebutuhan hanya untuk orang dewasa, anak-anak hanya punya keinginan",
        "Tidak ada perbedaan sama sekali"
      ],
      correct: 0,
      explanation: "Kebutuhan adalah hal yang wajib dipenuhi (makan, pakaian, alat tulis), sedangkan keinginan adalah barang tambahan yang jika tidak ada tidak mengganggu kehidupan."
    },
    {
      id: 5,
      question: "Siti memiliki uang Rp10.000. Ia membeli buku tulis seharga Rp6.000. Berapa uang kembalian yang harus diterima Siti?",
      options: [
        "Rp2.000",
        "Rp3.000",
        "Rp4.000",
        "Rp5.000"
      ],
      correct: 2,
      explanation: "Hitungan matematika: Rp10.000 dikurangi Rp6.000 = Rp4.000 kembalian."
    },
    {
      id: 6,
      question: "Manakah pernyataan yang BENAR mengenai nilai mata uang?",
      options: [
        "Uang kertas Rp1.000 nilainya lebih besar daripada koin logam Rp1.000",
        "Uang logam Rp1.000 nilainya sama besar dengan uang kertas Rp1.000",
        "Uang yang ukurannya lebih lebar selalu memiliki nilai yang lebih besar",
        "Warna uang menentukan apakah uang tersebut bisa dibelanjakan atau tidak"
      ],
      correct: 1,
      explanation: "Nilai uang ditentukan oleh angka nominalnya. Jadi koin Rp1.000 bernilai tepat sama dengan selembar kertas Rp1.000!"
    },
    {
      id: 7,
      question: "Jika kamu mendapatkan uang saku dari orang tua setiap hari, tindakan paling bijak adalah...",
      options: [
        "Menghabiskan semuanya untuk membeli jajanan dan mainan sekaligus",
        "Menyisihkan sebagian untuk ditabung ke dalam celengan sebelum jajan",
        "Membagikan semua uang kepada teman sampai tidak tersisa",
        "Menolak uang saku tersebut"
      ],
      correct: 1,
      explanation: "Anak bijak selalu menyisihkan uang di awal untuk ditabung di celengan demi keperluan penting di masa depan."
    },
    {
      id: 8,
      question: "Uang kertas pecahan Rp20.000 di Indonesia memiliki warna dominan...",
      options: [
        "Merah menyala",
        "Hijau segar",
        "Biru laut",
        "Ungu cerah"
      ],
      correct: 1,
      explanation: "Uang kertas Rp20.000 memiliki warna hijau dengan gambar pahlawan Dr. G.S.S.J. Ratulangi."
    },
    {
      id: 9,
      question: "Sebelum pergi berbelanja bersama Ibu, sebaiknya kita membuat...",
      options: [
        "Daftar catatan rencana belanja sesuai kebutuhan",
        "Gambar coret-coretan di buku gambar",
        "Daftar semua mainan di toko",
        "Daftar nama teman sekelas"
      ],
      correct: 0,
      explanation: "Catatan belanja membantu kita fokus membeli barang yang benar-benar dibutuhkan dan mencegah pemborosan."
    },
    {
      id: 10,
      question: "Dua lembar uang kertas Rp5.000 memiliki jumlah nilai yang sama dengan selembar uang...",
      options: [
        "Rp2.000",
        "Rp10.000",
        "Rp20.000",
        "Rp50.000"
      ],
      correct: 1,
      explanation: "Rp5.000 + Rp5.000 = Rp10.000! Dua lembar lima ribuan sama nilainya dengan satu lembar sepuluh ribuan."
    }
  ],

  // Badges System
  badges: [
    { id: "bintang-pintar", title: "Bintang Pintar", icon: "⭐", desc: "Mempelajari materi jenis dan nilai pecahan uang rupiah.", req: "Pelajari materi Tahap D & H" },
    { id: "juara-matematika", title: "Juara Matematika", icon: "🏆", desc: "Menyelesaikan simulasi hitung belanja di Market Niza.", req: "Selesaikan 7 Misi Market Niza" },
    { id: "si-rajin-membaca", title: "Si Rajin Membaca", icon: "📚", desc: "Menyimak seluruh narasi dan infografis pembelajaran.", req: "Baca narasi di Tahap D, H, & I" },
    { id: "jago-kuis", title: "Jago Kuis", icon: "🎯", desc: "Mendapatkan nilai kuis interaktif 80 atau lebih.", req: "Skor kuis minimal 80" },
    { id: "petualang-hebat", title: "Petualang Hebat", icon: "🚀", desc: "Menyelesaikan seluruh rute tahapan D-H-E-T-I-K.", req: "Selesaikan semua tahapan DHETIK" },
    { id: "pembeli-bijak", title: "Pembeli Bijak", icon: "🛒", desc: "Mampu membedakan kebutuhan dan mengelola anggaran Rp20.000.", req: "Lakukan simulasi belanja bijak" },
    { id: "sahabat-celengan", title: "Sahabat Celengan", icon: "🐷", desc: "Menyusun rencana belanja dan mengunggah karya celengan.", req: "Unggah karya pada Tahap K" }
  ]
};

window.RBC_DATA = RBC_DATA;

