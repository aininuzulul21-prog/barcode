<?php
/**
 * Setup script untuk inisialisasi database
 * Akses file ini sekali untuk membuat database
 */

// Create data directory if not exists
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
    echo "✅ Direktori data berhasil dibuat\n";
}

// Initialize database
require_once __DIR__ . '/api/init_db.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup Inventory Barcode</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .success { color: #16a34a; padding: 20px; background: #dcfce7; border-radius: 8px; }
        .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="success">
        <h1>✅ Setup Berhasil!</h1>
        <p>Database dan tabel telah dibuat.</p>
        <p style="font-size: 0.9rem; margin-top: 10px; color: #166534;">
            Database SQLite tersimpan di: <code>data/inventory.db</code>
        </p>
    </div>
    <a href="index.html" class="btn">🚀 Buka Aplikasi</a>
</body>
</html>

