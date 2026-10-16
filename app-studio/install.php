<?php
/**
 * One-time installer: creates the database and the `leads` table.
 * Visit http://localhost/app-studio/install.php once, then delete this file.
 */
declare(strict_types=1);

$cfg = require __DIR__ . '/config.php';
$d   = $cfg['db'];

$messages = [];

try {
    // Connect to the server *without* selecting a database first.
    $dsn = "mysql:host={$d['host']};port={$d['port']};charset={$d['charset']}";
    $pdo = new PDO($dsn, $d['user'], $d['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $pdo->exec(
        "CREATE DATABASE IF NOT EXISTS `{$d['name']}`
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    $messages[] = "Database `{$d['name']}` is ready.";

    $pdo->exec("USE `{$d['name']}`");

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `leads` (
            `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `name`       VARCHAR(120)  NOT NULL,
            `email`      VARCHAR(190)  NOT NULL,
            `phone`      VARCHAR(60)       NULL,
            `company`    VARCHAR(160)      NULL,
            `service`    VARCHAR(80)       NULL,
            `budget`     VARCHAR(80)       NULL,
            `message`    TEXT          NOT NULL,
            `status`     ENUM('new','read','archived') NOT NULL DEFAULT 'new',
            `ip`         VARBINARY(16)     NULL,
            `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_status_created` (`status`, `created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    $messages[] = "Table `leads` is ready.";

    $messages[] = "Installation complete. DELETE install.php now, then open index.php.";
    $ok = true;
} catch (Throwable $ex) {
    $ok = false;
    $messages[] = 'Error: ' . $ex->getMessage();
    $messages[] = 'Is MySQL running in the XAMPP Control Panel?';
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Installer &middot; <?= htmlspecialchars($cfg['site_name']) ?></title>
<style>
    body{font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#e8ecf8;
         display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
    .card{max-width:620px;width:100%;background:#141a30;border:1px solid #26304f;border-radius:16px;padding:32px}
    h1{margin:0 0 16px;font-size:1.4rem}
    ul{line-height:1.9;padding-left:20px}
    .ok{color:#5eead4}.err{color:#fb7185}
    a.btn{display:inline-block;margin-top:20px;background:#5b8cff;color:#fff;text-decoration:none;
          padding:12px 20px;border-radius:10px;font-weight:600}
    code{background:#0b1020;padding:2px 6px;border-radius:6px}
</style>
</head>
<body>
    <div class="card">
        <h1><?= $ok ? '✅ Setup successful' : '⚠️ Setup problem' ?></h1>
        <ul>
            <?php foreach ($messages as $m): ?>
                <li class="<?= $ok ? 'ok' : 'err' ?>"><?= htmlspecialchars($m) ?></li>
            <?php endforeach; ?>
        </ul>
        <?php if ($ok): ?>
            <a class="btn" href="index.php">Open the site &rarr;</a>
        <?php endif; ?>
    </div>
</body>
</html>
