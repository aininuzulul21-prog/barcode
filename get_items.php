<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();
    
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50;
    $offset = ($page - 1) * $limit;
    $search = trim($_GET['search'] ?? '');

    if (!empty($search)) {
        $stmt = $db->prepare('SELECT * FROM items WHERE item_name LIKE ? OR barcode LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute(["%$search%", "%$search%", $limit, $offset]);
        $countStmt = $db->prepare('SELECT COUNT(*) as total FROM items WHERE item_name LIKE ? OR barcode LIKE ?');
        $countStmt->execute(["%$search%", "%$search%"]);
    } else {
        $stmt = $db->prepare('SELECT * FROM items ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$limit, $offset]);
        $countStmt = $db->prepare('SELECT COUNT(*) as total FROM items');
        $countStmt->execute();
    }

    $items = $stmt->fetchAll();
    $total = $countStmt->fetch()['total'];
    $totalPages = ceil($total / $limit);

    echo json_encode([
        'success' => true,
        'data' => $items,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => $totalPages
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch items: ' . $e->getMessage()]);
}

