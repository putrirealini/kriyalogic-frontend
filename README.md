## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

*   [Node.js](https://nodejs.org/) (Versi LTS disarankan)
*   [npm](https://www.npmjs.com/) (Biasanya sudah terinstall bersama Node.js)

## Instalasi

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek ini secara lokal:

1.  **Clone repositori ini** (jika Anda menggunakan git):
    ```bash
    git clone <url-repositori-anda>
    cd kriyalogic
    ```

2.  **Install dependensi**:
    Jalankan perintah berikut di terminal untuk mengunduh semua pustaka yang diperlukan:
    ```bash
    npm install
    ```

## Menjalankan Aplikasi

Berikut adalah perintah-perintah yang tersedia dalam proyek ini:

### Mode Development
Untuk menjalankan aplikasi dalam mode pengembangan (development) dengan fitur Hot Module Replacement (HMR):
```bash
npm run dev
```
Setelah dijalankan, buka browser dan akses alamat lokal yang muncul di terminal (biasanya `http://localhost:5173`).

### Build untuk Produksi
Untuk membangun aplikasi agar siap dipublikasikan (production-ready):
```bash
npm run build
```
Perintah ini akan menghasilkan file statis di dalam folder `dist` yang telah dioptimalkan.

## Struktur Folder

*   `/src`: Berisi kode sumber aplikasi (komponen, halaman, hooks, dll).
*   `/public`: Berisi aset statis yang dapat diakses publik.
*   `index.html`: Titik masuk utama aplikasi.
*   `vite.config.js`: Konfigurasi untuk Vite.
*   `tailwind.config.js`: Konfigurasi untuk Tailwind CSS.