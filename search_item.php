<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $barcode = trim($input['barcode'] ?? '');
        $id = intval($input['id'] ?? 0);
    } else {
        $barcode = trim($_GET['barcode'] ?? '');
        $id = intval($_GET['id'] ?? 0);
    }

    $db = getDB();

    // Search by ID if provided
    if ($id > 0) {
        $stmt = $db->prepare('SELECT * FROM items WHERE id = ?');
        $stmt->execute([$id]);
    } elseif (!empty($barcode)) {
        $stmt = $db->prepare('SELECT * FROM items WHERE barcode = ?');
        $stmt->execute([$barcode]);
    } else {
        throw new Exception('Barcode or ID is required');
    }

    $item = $stmt->fetch();

    if ($item) {
        echo json_encode(['success' => true, 'data' => $item]);
    } else {
        echo json_encode(['success' => true, 'data' => null, 'message' => 'Item not found']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

