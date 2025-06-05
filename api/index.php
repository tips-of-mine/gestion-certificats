<?php
header('Content-Type: application/json');

// Enable error reporting for development
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow CORS for the frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define base API endpoint router
$requestUri = $_SERVER['REQUEST_URI'];
$endpoint = trim(str_replace('/api', '', parse_url($requestUri, PHP_URL_PATH)), '/');

// API endpoints
switch ($endpoint) {
    case 'certificates':
        getCertificates();
        break;
    case 'certificate/create':
        createCertificate();
        break;
    case 'certificate/revoke':
        revokeCertificate();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

// Get all certificates from the system
function getCertificates() {
    $certsDir = '/root/tls/intermediate/certs/';
    $privateDir = '/root/tls/intermediate/private/';
    $certificates = [];
    
    // Get all .cert.pem files
    $certFiles = glob($certsDir . '*.cert.pem');
    
    foreach ($certFiles as $certFile) {
        // Skip CA and intermediate certs
        $baseName = basename($certFile);
        if ($baseName === 'intermediate.cert.pem' || $baseName === 'ca.cert.pem' || $baseName === 'ca-chain.cert.pem' || $baseName === 'ocsp.cert.pem') {
            continue;
        }
        
        // Get certificate info
        $certName = str_replace('.cert.pem', '', basename($certFile));
        $certData = openssl_x509_parse(file_get_contents($certFile));
        
        // Check if key exists
        $keyFile = $privateDir . $certName . '.key.pem';
        $keyExists = file_exists($keyFile);
        
        // Check if revoked by looking for 'R' in the index.txt file
        $isRevoked = isRevoked($certName);
        
        // Get expiry date
        $validTo = isset($certData['validTo_time_t']) ? $certData['validTo_time_t'] : 0;
        $validFrom = isset($certData['validFrom_time_t']) ? $certData['validFrom_time_t'] : 0;
        
        // Get subject fields
        $subject = isset($certData['subject']) ? $certData['subject'] : [];
        $commonName = '';
        
        if (isset($subject['CN'])) {
            $commonName = $subject['CN'];
        }
        
        $certificates[] = [
            'id' => $certName,
            'name' => $certName,
            'domain' => $commonName,
            'issuedDate' => date('Y-m-d H:i:s', $validFrom),
            'expiryDate' => date('Y-m-d H:i:s', $validTo),
            'isRevoked' => $isRevoked,
        ];
    }
    
    echo json_encode(['certificates' => $certificates]);
}

// Check if a certificate is revoked
function isRevoked($certName) {
    $indexFile = '/root/tls/intermediate/index.txt';
    $content = file_get_contents($indexFile);
    $lines = explode("\n", $content);
    
    foreach ($lines as $line) {
        if (empty($line)) continue;
        $fields = explode("\t", $line);
        
        // If the line starts with 'R' and contains the cert name, it's revoked
        if (count($fields) >= 5 && $fields[0] === 'R' && strpos($fields[4], $certName) !== false) {
            return true;
        }
    }
    
    return false;
}

// Create a new certificate
function createCertificate() {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    // Get JSON request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);
    
    if (!isset($data['domain']) || !isset($data['additionalParam'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        return;
    }
    
    $domain = escapeshellarg($data['domain']);
    $additionalParam = escapeshellarg($data['additionalParam']);
    $username = isset($data['username']) ? $data['username'] : 'system';
    
    // Execute the certificate creation script
    $command = "/root/scripts/create_cert.sh $domain $additionalParam 2>&1";
    $output = [];
    $returnCode = 0;
    
    exec($command, $output, $returnCode);
    
    if ($returnCode !== 0) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create certificate', 'output' => implode("\n", $output)]);
        return;
    }
    
    // Log the action
    logAction('create', $domain, $username);
    
    echo json_encode(['success' => true, 'message' => 'Certificate created successfully']);
}

// Revoke a certificate
function revokeCertificate() {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    // Get JSON request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing certificate ID']);
        return;
    }
    
    $certId = escapeshellarg($data['id']);
    $username = isset($data['username']) ? $data['username'] : 'system';
    
    // Execute the revoke script
    $command = "/root/scripts/revoke_cert.sh $certId 2>&1";
    $output = [];
    $returnCode = 0;
    
    exec($command, $output, $returnCode);
    
    if ($returnCode !== 0) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to revoke certificate', 'output' => implode("\n", $output)]);
        return;
    }
    
    // Log the action
    logAction('revoke', $certId, $username);
    
    echo json_encode(['success' => true, 'message' => 'Certificate revoked successfully']);
}

// Log certificate actions
function logAction($action, $certificateName, $username) {
    $logDir = '/var/www/html/api/logs';
    
    // Create logs directory if it doesn't exist
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/certificate_actions.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = json_encode([
        'id' => uniqid(),
        'timestamp' => $timestamp,
        'username' => $username,
        'action' => $action,
        'certificateName' => $certificateName
    ]) . "\n";
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}