<?php
/**
 * Database connection + shared helpers.
 */

function config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $cfg = require __DIR__ . '/config.php';
    }
    return $cfg;
}

/**
 * Return a shared PDO connection to the application database.
 */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $d   = config()['db'];
        $dsn = "mysql:host={$d['host']};port={$d['port']};dbname={$d['name']};charset={$d['charset']}";
        $pdo = new PDO($dsn, $d['user'], $d['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/**
 * True when the database + leads table exist.
 */
function db_ready(): bool
{
    try {
        db()->query('SELECT 1 FROM leads LIMIT 1');
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

/**
 * Escape text for safe HTML output.
 */
function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Start a session only once.
 */
function boot_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Get (or create) a CSRF token for the current session.
 */
function csrf_token(): string
{
    boot_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/**
 * Constant-time CSRF check.
 */
function csrf_valid(?string $token): bool
{
    boot_session();
    return is_string($token)
        && !empty($_SESSION['csrf'])
        && hash_equals($_SESSION['csrf'], $token);
}
