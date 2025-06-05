<?php
header('Content-Type: application/json');

// Comment out error reporting to prevent it from corrupting JSON output
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// Allow CORS for the frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the history log
$logFile = __DIR__ . '/logs/certificate_actions.log';
$history = [];

if (file_exists($logFile)) {
    $logLines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($logLines as $line) {
        $entry = json_decode($line, true);
        if ($entry) {
            $history[] = $entry;
        }
    }
}

// Sort by timestamp (newest first)
usort($history, function($a, $b) {
    return strtotime($b['timestamp']) - strtotime($a['timestamp']);
});

echo json_encode(['history' => $history]);