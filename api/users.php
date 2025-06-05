<?php
header('Content-Type: application/json');

// Disable error reporting to prevent it from corrupting JSON output
ini_set('display_errors', 'Off');
error_reporting(0);

// Allow CORS for the frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// User data storage
$usersFile = __DIR__ . '/data/users.json';
$usersDir = __DIR__ . '/data';

// Create data directory if it doesn't exist
if (!file_exists($usersDir)) {
    mkdir($usersDir, 0755, true);
}

// Create default users if the file doesn't exist
if (!file_exists($usersFile)) {
    $defaultUsers = [
        [
            'id' => '1',
            'username' => 'admin',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'role' => 'admin'
        ],
        [
            'id' => '2',
            'username' => 'user',
            'password' => password_hash('user123', PASSWORD_DEFAULT),
            'role' => 'user'
        ]
    ];
    
    file_put_contents($usersFile, json_encode(['users' => $defaultUsers], JSON_PRETTY_PRINT));
}

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$endpoint = trim(str_replace('/api/users', '', parse_url($requestUri, PHP_URL_PATH)), '/');

// Handle different endpoints
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getUsers();
        break;
    case 'POST':
        if ($endpoint === 'login') {
            login();
        } else {
            addUser();
        }
        break;
    case 'DELETE':
        deleteUser();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Get all users (without passwords)
function getUsers() {
    global $usersFile;
    
    $data = json_decode(file_get_contents($usersFile), true);
    $users = $data['users'] ?? [];
    
    // Remove passwords from the response
    foreach ($users as &$user) {
        unset($user['password']);
    }
    
    echo json_encode(['users' => $users]);
}

// Login functionality
function login() {
    global $usersFile;
    
    // Get JSON request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing username or password']);
        return;
    }
    
    $username = $data['username'];
    $password = $data['password'];
    
    // Get users
    $userData = json_decode(file_get_contents($usersFile), true);
    $users = $userData['users'] ?? [];
    
    // Find user by username
    $user = null;
    foreach ($users as $u) {
        if ($u['username'] === $username) {
            $user = $u;
            break;
        }
    }
    
    // Check if user exists and password is correct
    if ($user && password_verify($password, $user['password'])) {
        // Remove password from response
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
    }
}

// Add new user
function addUser() {
    global $usersFile;
    
    // Get JSON request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);
    
    if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    // Only admins can add users
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $username = $data['username'];
    $password = $data['password'];
    $role = $data['role'];
    
    // Validate role
    if ($role !== 'admin' && $role !== 'user') {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid role']);
        return;
    }
    
    // Get current users
    $userData = json_decode(file_get_contents($usersFile), true);
    $users = $userData['users'] ?? [];
    
    // Check if username already exists
    foreach ($users as $user) {
        if ($user['username'] === $username) {
            http_response_code(400);
            echo json_encode(['error' => 'Username already exists']);
            return;
        }
    }
    
    // Create new user
    $newUser = [
        'id' => uniqid(),
        'username' => $username,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'role' => $role
    ];
    
    // Add user
    $users[] = $newUser;
    $userData['users'] = $users;
    file_put_contents($usersFile, json_encode($userData, JSON_PRETTY_PRINT));
    
    // Remove password from response
    unset($newUser['password']);
    echo json_encode(['success' => true, 'user' => $newUser]);
}

// Delete user
function deleteUser() {
    global $usersFile;
    
    // Get JSON request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing user ID']);
        return;
    }
    
    // Only admins can delete users
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $userId = $data['id'];
    
    // Get current users
    $userData = json_decode(file_get_contents($usersFile), true);
    $users = $userData['users'] ?? [];
    
    // Remove user
    $found = false;
    foreach ($users as $key => $user) {
        if ($user['id'] === $userId) {
            unset($users[$key]);
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Reindex array
    $users = array_values($users);
    $userData['users'] = $users;
    file_put_contents($usersFile, json_encode($userData, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true]);
}

// Check if the requester is an admin
function isAdmin() {
    // In a real application, this would verify a JWT or session
    // For now, we'll assume it's an admin for demonstration
    return true;
}