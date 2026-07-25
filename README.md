# 📦 Inventory Barcode Scanner

Aplikasi web untuk manajemen inventaris barang dengan pemindaian barcode menggunakan kamera.

## 🚀 Fitur

- ✅ **Pindai Barcode** - Gunakan kamera untuk memindai barcode barang (EAN, UPC, Code 128, Code 39, dll)
- ✅ **Input Manual** - Masukkan barcode secara manual jika scanner tidak dapat digunakan
- ✅ **CRUD Lengkap** - Tambah, Edit, Hapus, dan Cari barang
- ✅ **Database SQLite** - Penyimpanan data yang ringan dan tanpa konfigurasi
- ✅ **Responsive** - Bisa digunakan di HP, tablet, dan desktop
- ✅ **Cari & Filter** - Cari barang berdasarkan nama atau barcode

## 📋 Struktur Database

| Field       | Tipe        | Keterangan                |
|-------------|-------------|---------------------------|
| id          | INTEGER     | Primary Key (auto)        |
| barcode     | TEXT (unik) | Kode barcode barang       |
| item_name   | TEXT        | Nama barang               |
| quantity    | INTEGER     | Jumlah stok               |
| price       | REAL        | Harga barang              |
| category    | TEXT        | Kategori barang           |
| description | TEXT        | Deskripsi barang          |
| created_at  | DATETIME    | Tanggal ditambahkan       |
| updated_at  | DATETIME    | Tanggal diperbarui        |

## 🔧 Instalasi

### Prasyarat
- PHP 7.4+ (dengan ekstensi `pdo_sqlite`)
- Web server (Apache, Nginx, atau PHP built-in server)

### Langkah-langkah

1. **Clone atau download proyek ini**
2. **Letakkan folder `barcode-inventory`** di direktori web server (misalnya `htdocs` untuk XAMPP)
3. **Akses setup** melalui browser:
   ```
   http://localhost/barcode-inventory/setup.php
   ```
4. **Atau gunakan PHP built-in server** (tanpa XAMPP):
   ```bash
   cd barcode-inventory
   php -S localhost:8000
   ```
   lalu akses:
   ```
   http://localhost:8000/setup.php
   ```

5. **Setelah setup berhasil**, buka:
   ```
   http://localhost:8000/index.html
   ```

### Menggunakan XAMPP / Laragon
1. Copy folder `barcode-inventory` ke `C:\xampp\htdocs\` atau `C:\laragon\www\`
2. Buka `http://localhost/barcode-inventory/setup.php`
3. Lanjut ke `http://localhost/barcode-inventory/index.html`

## 📱 Penggunaan

1. **Mulai Scanner** - Klik tombol "Mulai Scanner" dan izinkan akses kamera
2. **Arahkan kamera** ke barcode barang
3. **Form akan terisi otomatis** jika barang sudah ada (edit) atau kosong (barang baru)
4. **Isi data** nama barang, jumlah, harga, dll
5. **Klik Simpan** untuk menyimpan ke database
6. **Lihat daftar barang** di bagian bawah halaman

## 🛠️ API Endpoints

| Endpoint          | Method | Deskripsi                |
|-------------------|--------|--------------------------|
| `api/add_item.php` | POST   | Tambah barang baru       |
| `api/get_items.php` | GET   | Ambil daftar barang      |
| `api/search_item.php` | POST | Cari barang per barcode |
| `api/update_item.php` | POST | Update data barang       |
| `api/delete_item.php` | POST | Hapus barang             |

## 📄 Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

