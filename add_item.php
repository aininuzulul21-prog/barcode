<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $barcode = trim($input['barcode'] ?? '');
    $item_name = trim($input['item_name'] ?? '');
    $quantity = intval($input['quantity'] ?? 0);
    $price = floatval($input['price'] ?? 0);
    $category = trim($input['category'] ?? '');
    $description = trim($input['description'] ?? '');

    // Validate required fields
    if (empty($barcode)) {
        throw new Exception('Barcode is required');
    }
    if (empty($item_name)) {
        throw new Exception('Item name is required');
    }

    $db = getDB();

    // Check if barcode already exists
    $stmt = $db->prepare('SELECT id FROM items WHERE barcode = ?');
    $stmt->execute([$barcode]);
    
    if ($stmt->fetch()) {
        // Update existing item quantity
        $stmt = $db->prepare('UPDATE items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE barcode = ?');
        $stmt->execute([$quantity, $barcode]);
        echo json_encode(['success' => true, 'message' => 'Item quantity updated']);
    } else {
        // Insert new item
        $stmt = $db->prepare('INSERT INTO items (barcode, item_name, quantity, price, category, description) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$barcode, $item_name, $quantity, $price, $category, $description]);
        echo json_encode(['success' => true, 'message' => 'Item added successfully']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

