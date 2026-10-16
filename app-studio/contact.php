<?php
/**
 * Handles the contact form: validates, stores the lead in MySQL,
 * emails a notification, and returns JSON for the front-end.
 */
declare(strict_types=1);

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/** Small helper to emit a JSON response and stop. */
function respond(bool $ok, string $message, array $extra = [], int $code = 200): never
{
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(false, 'Method not allowed.', [], 405);
}

$cfg = config();

// --- CSRF ---------------------------------------------------------------
if (!csrf_valid($_POST['csrf'] ?? null)) {
    respond(false, 'Your session expired. Please refresh the page and try again.', [], 419);
}

// --- Honeypot (bots fill hidden fields) --------------------------------
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, 'Thanks!'); // pretend success, store nothing
}

// --- Collect + trim -----------------------------------------------------
$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$phone   = trim((string) ($_POST['phone'] ?? ''));
$company = trim((string) ($_POST['company'] ?? ''));
$service = trim((string) ($_POST['service'] ?? ''));
$budget  = trim((string) ($_POST['budget'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

// --- Validate -----------------------------------------------------------
$errors = [];
if (mb_strlen($name) < 2)                 $errors['name']    = 'Please enter your name.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email.';
if (mb_strlen($message) < 10)             $errors['message'] = 'Please describe your project (at least 10 characters).';
if (mb_strlen($name) > 120 || mb_strlen($email) > 190 || mb_strlen($message) > 5000) {
    $errors['form'] = 'One of your entries is too long.';
}
if ($errors) {
    respond(false, 'Please fix the highlighted fields.', ['errors' => $errors], 422);
}

// --- Basic flood protection: max 5 submissions / 10 min / IP -----------
$ipBinary = @inet_pton($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0') ?: null;
try {
    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM leads
         WHERE ip <=> :ip AND created_at > (NOW() - INTERVAL 10 MINUTE)'
    );
    $stmt->execute([':ip' => $ipBinary]);
    if ((int) $stmt->fetchColumn() >= 5) {
        respond(false, 'Too many messages from your connection. Please try again later.', [], 429);
    }
} catch (Throwable $e) {
    // If the check fails, don't block a real lead.
}

// --- Store --------------------------------------------------------------
try {
    $stmt = db()->prepare(
        'INSERT INTO leads (name, email, phone, company, service, budget, message, ip)
         VALUES (:name, :email, :phone, :company, :service, :budget, :message, :ip)'
    );
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone !== '' ? $phone : null,
        ':company' => $company !== '' ? $company : null,
        ':service' => $service !== '' ? $service : null,
        ':budget'  => $budget !== '' ? $budget : null,
        ':message' => $message,
        ':ip'      => $ipBinary,
    ]);
    $leadId = (int) db()->lastInsertId();
} catch (Throwable $ex) {
    error_log('[contact] DB insert failed: ' . $ex->getMessage());
    respond(false, 'Sorry, something went wrong saving your message. Please try again.', [], 500);
}

// --- Email notification (best effort) ----------------------------------
$subject = "[{$cfg['site_name']}] New enquiry from {$name}";
$body    = "New project enquiry\n"
         . "====================\n"
         . "Name:    {$name}\n"
         . "Email:   {$email}\n"
         . "Phone:   {$phone}\n"
         . "Company: {$company}\n"
         . "Service: {$service}\n"
         . "Budget:  {$budget}\n"
         . "IP:      " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n"
         . "Time:    " . date('Y-m-d H:i:s') . "\n\n"
         . "Message:\n{$message}\n";
$headers = "From: {$cfg['site_name']} <{$cfg['email']}>\r\n"
         . "Reply-To: {$name} <{$email}>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$mailed = false;
if (function_exists('mail')) {
    $mailed = @mail($cfg['email'], $subject, $body, $headers);
}

// Always keep a local copy so a lead is never lost if mail isn't configured.
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0775, true);
}
@file_put_contents(
    $logDir . '/leads.log',
    str_repeat('-', 60) . "\n" . $body,
    FILE_APPEND | LOCK_EX
);

respond(true, "Thanks, {$name}! Your message was received" . ($mailed ? ' and emailed to us' : '') . '. We\'ll get back to you shortly.');
