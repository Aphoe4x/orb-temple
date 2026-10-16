<?php
/**
 * Simple admin area: log in with the password from config.php,
 * then read / manage the leads collected by the contact form.
 */
declare(strict_types=1);
require __DIR__ . '/db.php';
boot_session();

$cfg = config();
$ready = db_ready();
$error = '';

// --- Logout -------------------------------------------------------------
if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: admin.php');
    exit;
}

// --- Login --------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['password'])) {
    if (hash_equals((string) $cfg['admin_password'], (string) $_POST['password'])) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        header('Location: admin.php');
        exit;
    }
    $error = 'Wrong password.';
}

$loggedIn = !empty($_SESSION['admin']);

// --- Actions (only when logged in) -------------------------------------
if ($loggedIn && $ready && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $id = (int) ($_POST['id'] ?? 0);
    if (isset($_POST['mark']) && $id > 0 && in_array($_POST['mark'], ['new', 'read', 'archived'], true)) {
        db()->prepare('UPDATE leads SET status = ? WHERE id = ?')->execute([$_POST['mark'], $id]);
    }
    if (isset($_POST['delete']) && $id > 0) {
        db()->prepare('DELETE FROM leads WHERE id = ?')->execute([$id]);
    }
    header('Location: admin.php');
    exit;
}

// --- Fetch leads --------------------------------------------------------
$filter = in_array($_GET['status'] ?? '', ['new', 'read', 'archived'], true) ? $_GET['status'] : '';
$leads  = [];
$counts = ['new' => 0, 'read' => 0, 'archived' => 0, 'all' => 0];

if ($loggedIn && $ready) {
    try {
        foreach (db()->query('SELECT status, COUNT(*) c FROM leads GROUP BY status') as $row) {
            $counts[$row['status']] = (int) $row['c'];
            $counts['all'] += (int) $row['c'];
        }
        if ($filter !== '') {
            $stmt = db()->prepare('SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT 300');
            $stmt->execute([$filter]);
        } else {
            $stmt = db()->query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 300');
        }
        $leads = $stmt->fetchAll();
    } catch (Throwable $e) {
        $error = 'Could not load leads: ' . $e->getMessage();
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Leads · <?= e($cfg['site_name']) ?></title>
<link rel="stylesheet" href="assets/style.css">
<style>
  body{padding-bottom:60px}
  .top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
       padding:22px;border-bottom:1px solid var(--border);background:var(--bg-alt);position:sticky;top:0;z-index:5}
  .top h1{margin:0;font-size:1.2rem}
  .tabs{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0}
  .tabs a{padding:8px 16px;border-radius:999px;border:1px solid var(--border);text-decoration:none;color:var(--muted);font-size:.9rem}
  .tabs a.active{background:linear-gradient(135deg,var(--primary),var(--primary-2));color:#fff;border-color:transparent}
  .lead{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px}
  .lead__head{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:flex-start}
  .lead__head h3{margin:0;font-size:1.05rem}
  .lead__meta{color:var(--muted);font-size:.86rem;display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 12px}
  .lead__msg{white-space:pre-wrap;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:.94rem}
  .badge{font-size:.72rem;padding:4px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
  .badge--new{background:rgba(45,212,191,.18);color:#7ff0dd;border:1px solid rgba(45,212,191,.4)}
  .badge--read{background:rgba(91,140,255,.18);color:#a9c0ff;border:1px solid rgba(91,140,255,.4)}
  .badge--archived{background:rgba(154,166,201,.15);color:var(--muted);border:1px solid var(--border)}
  .lead__actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .lead__actions button{font:inherit;font-size:.85rem;padding:7px 14px;border-radius:8px;cursor:pointer;
       background:var(--surface-2);border:1px solid var(--border);color:var(--text)}
  .lead__actions button:hover{border-color:var(--primary)}
  .lead__actions button.danger:hover{border-color:var(--danger);color:var(--danger)}
  .login{max-width:420px;margin:14vh auto}
  .empty{color:var(--muted);padding:40px 0;text-align:center}
  a.maillink{color:var(--accent);text-decoration:none}
</style>
</head>
<body>

<?php if (!$loggedIn): ?>
  <div class="container login">
    <div class="form">
      <h1 style="font-size:1.3rem">Admin login</h1>
      <p class="muted">Enter the password from <code>config.php</code>.</p>
      <?php if ($error): ?><div class="notice notice--warn"><?= e($error) ?></div><?php endif; ?>
      <form method="post">
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autofocus required>
        </div>
        <button class="btn btn--primary" type="submit">Log in</button>
      </form>
    </div>
  </div>
<?php else: ?>
  <div class="top">
    <h1>📥 Leads <span class="muted" style="font-weight:400">(<?= (int) $counts['all'] ?>)</span></h1>
    <div>
      <a class="btn btn--ghost" href="index.php">View site</a>
      <a class="btn btn--ghost" href="?logout=1">Log out</a>
    </div>
  </div>

  <div class="container">
    <?php if (!$ready): ?>
      <div class="notice notice--warn">Database not set up yet. Run <a href="install.php">install.php</a> first.</div>
    <?php endif; ?>
    <?php if ($error): ?><div class="notice notice--warn"><?= e($error) ?></div><?php endif; ?>

    <div class="tabs">
      <a class="<?= $filter === '' ? 'active' : '' ?>" href="admin.php">All (<?= (int) $counts['all'] ?>)</a>
      <a class="<?= $filter === 'new' ? 'active' : '' ?>" href="?status=new">New (<?= (int) $counts['new'] ?>)</a>
      <a class="<?= $filter === 'read' ? 'active' : '' ?>" href="?status=read">Read (<?= (int) $counts['read'] ?>)</a>
      <a class="<?= $filter === 'archived' ? 'active' : '' ?>" href="?status=archived">Archived (<?= (int) $counts['archived'] ?>)</a>
    </div>

    <?php if (!$leads): ?>
      <p class="empty">No leads here yet.</p>
    <?php endif; ?>

    <?php foreach ($leads as $lead): ?>
      <article class="lead">
        <div class="lead__head">
          <h3><?= e($lead['name']) ?> <?php if ($lead['company']): ?><span class="muted">· <?= e($lead['company']) ?></span><?php endif; ?></h3>
          <span class="badge badge--<?= e($lead['status']) ?>"><?= e($lead['status']) ?></span>
        </div>
        <div class="lead__meta">
          <span>✉️ <a class="maillink" href="mailto:<?= e($lead['email']) ?>"><?= e($lead['email']) ?></a></span>
          <?php if ($lead['phone']): ?><span>📞 <?= e($lead['phone']) ?></span><?php endif; ?>
          <?php if ($lead['service']): ?><span>🧩 <?= e($lead['service']) ?></span><?php endif; ?>
          <?php if ($lead['budget']): ?><span>💰 <?= e($lead['budget']) ?></span><?php endif; ?>
          <span>🕒 <?= e($lead['created_at']) ?></span>
        </div>
        <div class="lead__msg"><?= e($lead['message']) ?></div>
        <div class="lead__actions">
          <?php foreach (['read' => 'Mark read', 'new' => 'Mark new', 'archived' => 'Archive'] as $val => $label): ?>
            <?php if ($lead['status'] !== $val): ?>
              <form method="post" style="display:inline">
                <input type="hidden" name="id" value="<?= (int) $lead['id'] ?>">
                <input type="hidden" name="mark" value="<?= e($val) ?>">
                <button type="submit"><?= e($label) ?></button>
              </form>
            <?php endif; ?>
          <?php endforeach; ?>
          <form method="post" style="display:inline" onsubmit="return confirm('Delete this lead permanently?');">
            <input type="hidden" name="id" value="<?= (int) $lead['id'] ?>">
            <button class="danger" type="submit" name="delete" value="1">Delete</button>
          </form>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

</body>
</html>
