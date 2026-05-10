import * as fs from "fs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const doc = new Document({
    creator: "Panji",
    title: "Laporan UTS Pemrograman 3",
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "Laporan UTS - Sistem Informasi Sekolah",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Nama: ", bold: true }),
                        new TextRun("[Nama Anda]\n"),
                        new TextRun({ text: "NIM: ", bold: true }),
                        new TextRun("[NIM Anda]\n"),
                        new TextRun({ text: "Mata Kuliah: ", bold: true }),
                        new TextRun("Pemrograman 3"),
                    ],
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "1. Tema Proyek yang Dipilih",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun("Tema proyek yang saya pilih untuk UTS ini adalah "),
                        new TextRun({ text: "Sistem Informasi Sekolah (Manajemen Data Siswa)", bold: true }),
                        new TextRun(". Proyek ini berfokus pada pembuatan sistem untuk mengelola dan menampilkan daftar data siswa (seperti NIS, Nama, Kelas, Alamat, dan Email) secara terintegrasi antara Frontend (React & Tailwind CSS), Backend (Golang & Fiber), dan Database (PostgreSQL di Supabase).")
                    ],
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "2. Penjelasan Alur Proses dari Frontend Request hingga Backend Response",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "Alur kerja aplikasi saat melakukan proses Fetch dan Display data adalah sebagai berikut:"
                }),
                new Paragraph({
                    text: "1. Frontend Request: Saat pengguna membuka halaman utama atau halaman detail, aplikasi Frontend (React.js) akan mengeksekusi hook useEffect yang kemudian memanggil fungsi fetch() untuk mengirim HTTP GET Request ke endpoint API Backend (misal: http://localhost:3000/api/siswa).",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "2. Backend Routing (Fiber): Request yang masuk diterima oleh framework Go Fiber di Backend. Router akan mencocokkan rute HTTP yang diminta dan mengarahkannya ke Handler yang sesuai (contoh: fungsi GetAllSiswa).",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "3. Service & Repository Logic: Handler meneruskan permintaan tersebut ke lapisan Service untuk menangani business logic dan aturan aplikasi, yang kemudian memanggil lapisan Repository untuk melakukan manipulasi atau pengambilan data.",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "4. Database Query (GORM & Supabase): Di dalam Repository, Object-Relational Mapping (GORM) digunakan untuk mengeksekusi perintah SQL (seperti SELECT * FROM siswas) ke database PostgreSQL yang di-hosting di layanan Supabase.",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "5. Backend Response: Setelah database mengembalikan hasil data siswa, Repository mengirimkannya kembali ke Handler (melalui Service). Handler kemudian membungkus data tersebut ke dalam format JSON dan mengirimkan HTTP Response dengan status kode 200 (OK) ke aplikasi Frontend.",
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    text: "6. Frontend Rendering: Frontend menerima response JSON tersebut, lalu menyimpan data utamanya ke dalam React State. Perubahan state ini memicu antarmuka UI untuk melakukan re-render, sehingga tabel data siswa atau halaman profil detail siswa otomatis muncul di layar dengan tata letak yang sudah dibuat menggunakan Tailwind CSS.",
                    bullet: { level: 0 }
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3. URL Repository GitHub Backend dan Frontend",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "URL Repository Backend: ", bold: true }),
                        new TextRun("[Masukkan Link GitHub Backend Anda di sini, cth: https://github.com/username/backend-sekolah]")
                    ],
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "URL Repository Frontend: ", bold: true }),
                        new TextRun("[Masukkan Link GitHub Frontend Anda di sini, cth: https://github.com/username/frontend-sekolah]")
                    ],
                    bullet: { level: 0 }
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "4. Screenshot Database PostgreSQL Supabase beserta Isi Tabel",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "(Hapus teks ini dan paste gambar screenshot dari dashboard Supabase Anda yang menampilkan tabel 'siswas' beserta baris datanya di bawah ini)",
                    italics: true
                }),
                new Paragraph({ text: "\n[ TEMPAT SCREENSHOT DATABASE ]\n" }),
                new Paragraph({
                    text: "5. Screenshot Pengujian API menggunakan Postman",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "(Hapus teks ini dan paste gambar screenshot dari aplikasi Postman saat Anda melakukan metode GET ke endpoint http://localhost:3000/api/siswa dan GET By ID di bawah ini)",
                    italics: true
                }),
                new Paragraph({ text: "\n[ TEMPAT SCREENSHOT POSTMAN ]\n" }),
                new Paragraph({
                    text: "6. Screenshot Tampilan Frontend",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "(Hapus teks ini dan paste gambar screenshot dari tampilan halaman website Frontend yang memuat tabel siswa dan halaman detail siswa di bawah ini)",
                    italics: true
                }),
                new Paragraph({ text: "\n[ TEMPAT SCREENSHOT FRONTEND ]\n" }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("../Laporan_UTS.docx", buffer);
    console.log("File Laporan_UTS.docx berhasil dibuat!");
});
