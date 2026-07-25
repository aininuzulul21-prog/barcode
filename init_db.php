<?php
require_once __DIR__ . '/db.php';

// Initialize database tables
try {
    $db = getDB();
    
    // Create items table
    $db->exec('CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT UNIQUE NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        price REAL DEFAULT 0,
        category TEXT DEFAULT "",
        description TEXT DEFAULT "",
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )');

    // Create index on barcode for faster lookups
    $db->exec('CREATE INDEX IF NOT EXISTS idx_barcode ON items(barcode)');

    echo json_encode(['success' => true, 'message' => 'Database initialized successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database initialization failed: ' . $e->getMessage()]);
}

