<?php

declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if (is_string($path) && str_starts_with($path, '/api')) {
    require __DIR__ . '/index.php';
    return true;
}

return false;
