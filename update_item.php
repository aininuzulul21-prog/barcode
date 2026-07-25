<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

    $id = intval($input['id'] ?? 0);
    $barcode = trim($input['barcode'] ?? '');
    $item_name = trim($input['item_name'] ?? '');
    $quantity = intval($input['quantity'] ?? 0);
    $price = floatval($input['price'] ?? 0);
    $category = trim($input['category'] ?? '');
    $description = trim($input['description'] ?? '');

    if ($id <= 0) {
        throw new Exception('Valid item ID is required');
    }

    $db = getDB();
    $stmt = $db->prepare('UPDATE items SET barcode = ?, item_name = ?, quantity = ?, price = ?, category = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    $stmt->execute([$barcode, $item_name, $quantity, $price, $category, $description, $id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Item updated successfully']);
    } else {
        throw new Exception('Item not found');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

