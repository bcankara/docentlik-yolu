<?php
/**
 * Doçentlik Yolu - API
 * Kişisel ilerleme takibi için basit JSON tabanlı API
 * Tek kullanıcı + Ziyaretçi modu destekli
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Yardımcı fonksiyonlar
function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

function getSelectedArea() {
    return $_SESSION['selected_area'] ?? 'muhendislik';
}

function getDataFile() {
    $area = getSelectedArea();
    return DATA_DIR . '/user_progress_' . $area . '.json';
}

function getCriteriaFile($area = null) {
    if ($area === null) {
        $area = getSelectedArea();
    }
    return KRITERLER_DIR . '/' . $area . '.json';
}

function initializeDataFile($file) {
    if (!file_exists(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }
    
    if (!file_exists($file)) {
        $initialData = [
            'user' => [
                'name' => '',
                'email' => '',
                'created_at' => date('Y-m-d H:i:s'),
                'last_updated' => date('Y-m-d H:i:s')
            ],
            'tasks' => [],
            'achievements' => [],
            'total_points' => 0,
            'post_doc_points' => 0
        ];
        file_put_contents($file, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
            $_SESSION['logged_in'] = true;
            $_SESSION['login_time'] = time();
            echo json_encode(['success' => true, 'message' => 'Giriş başarılı']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Kullanıcı adı veya şifre hatalı']);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Çıkış yapıldı']);
        break;

    case 'check_auth':
        echo json_encode([
            'success' => true,
            'logged_in' => isLoggedIn(),
            'selected_area' => getSelectedArea()
        ]);
        break;

    case 'get_areas':
        // Mevcut alanları listele
        $areasFile = KRITERLER_DIR . '/alanlar.json';
        if (file_exists($areasFile)) {
            $areas = json_decode(file_get_contents($areasFile), true);
            echo json_encode(['success' => true, 'data' => $areas]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Alan listesi bulunamadı']);
        }
        break;

    case 'select_area':
        $input = json_decode(file_get_contents('php://input'), true);
        $area = $input['area'] ?? 'muhendislik';
        
        // Geçerli alan mı kontrol et
        $criteriaFile = getCriteriaFile($area);
        if (file_exists($criteriaFile)) {
            $_SESSION['selected_area'] = $area;
            echo json_encode(['success' => true, 'message' => 'Alan seçildi', 'area' => $area]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Geçersiz alan']);
        }
        break;

    case 'get_criteria':
        $area = $_GET['area'] ?? getSelectedArea();
        $criteriaFile = getCriteriaFile($area);
        
        if (file_exists($criteriaFile)) {
            $criteria = json_decode(file_get_contents($criteriaFile), true);
            echo json_encode(['success' => true, 'data' => $criteria, 'area' => $area], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'error' => 'Kriter dosyası bulunamadı: ' . $area]);
        }
        break;

    case 'get_progress':
        // Ziyaretçi modunda progress yok
        if (!isLoggedIn()) {
            echo json_encode([
                'success' => true, 
                'data' => [
                    'tasks' => [],
                    'achievements' => [],
                    'total_points' => 0,
                    'post_doc_points' => 0
                ],
                'visitor_mode' => true
            ]);
            break;
        }
        
        $dataFile = getDataFile();
        initializeDataFile($dataFile);
        
        $data = json_decode(file_get_contents($dataFile), true);
        $data['visitor_mode'] = false;
        echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
        break;

    case 'save_progress':
        // Ziyaretçi modunda kaydetme yok
        if (!isLoggedIn()) {
            echo json_encode(['success' => false, 'error' => 'Kaydetmek için giriş yapmalısınız', 'visitor_mode' => true]);
            break;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            echo json_encode(['success' => false, 'error' => 'Geçersiz veri']);
            break;
        }

        $dataFile = getDataFile();
        initializeDataFile($dataFile);
        
        $data = json_decode(file_get_contents($dataFile), true);
        
        if (isset($input['tasks'])) {
            $data['tasks'] = $input['tasks'];
        }
        if (isset($input['achievements'])) {
            $data['achievements'] = $input['achievements'];
        }
        if (isset($input['total_points'])) {
            $data['total_points'] = $input['total_points'];
        }
        if (isset($input['post_doc_points'])) {
            $data['post_doc_points'] = $input['post_doc_points'];
        }
        
        $data['user']['last_updated'] = date('Y-m-d H:i:s');
        
        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        echo json_encode(['success' => true, 'message' => 'Kaydedildi']);
        break;

    case 'reset':
        if (!isLoggedIn()) {
            echo json_encode(['success' => false, 'error' => 'Sıfırlamak için giriş yapmalısınız']);
            break;
        }
        
        $dataFile = getDataFile();
        $initialData = [
            'user' => [
                'name' => '',
                'email' => '',
                'created_at' => date('Y-m-d H:i:s'),
                'last_updated' => date('Y-m-d H:i:s')
            ],
            'tasks' => [],
            'achievements' => [],
            'total_points' => 0,
            'post_doc_points' => 0
        ];
        file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'message' => 'İlerleme sıfırlandı']);
        break;

    default:
        echo json_encode([
            'success' => false, 
            'error' => 'Geçersiz eylem',
            'available_actions' => ['login', 'logout', 'check_auth', 'get_areas', 'select_area', 'get_criteria', 'get_progress', 'save_progress', 'reset']
        ]);
}
