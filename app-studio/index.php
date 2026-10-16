<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

$cfg       = config();
$ready     = db_ready();
$token     = csrf_token();
$name      = $cfg['owner_name'];
$brand     = $cfg['site_name'];
$year      = date('Y');
$wa        = preg_replace('/\D+/', '', (string) $cfg['whatsapp']);
$tg        = ltrim((string) $cfg['telegram'], '@');
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($name) ?> — <?= e($cfg['tagline']) ?></title>
<meta name="description" content="<?= e($name) ?> builds AI-powered apps, websites and automations for businesses. Tell me about your project.">
<link rel="stylesheet" href="assets/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#129302;</text></svg>">
</head>
<body>

<header class="nav" id="top">
  <a class="nav__brand" href="#top">
    <span class="nav__logo">&lt;/&gt;</span>
    <span><?= e($brand) ?></span>
  </a>
  <nav class="nav__links" aria-label="Primary">
    <a href="#services">Services</a>
    <a href="#process">Process</a>
    <a href="#work">Work</a>
    <a href="#publish">App Stores</a>
    <a class="nav__cta" href="#contact">Start a project</a>
  </nav>
</header>

<main>
  <!-- Hero -->
  <section class="hero">
    <div class="hero__glow" aria-hidden="true"></div>
    <div class="container hero__inner">
      <p class="eyebrow"><?= e($cfg['tagline']) ?></p>
      <h1>I build <span class="grad">AI-powered apps</span> that grow your business.</h1>
      <p class="lead">
        Need a mobile app, a customer-facing website, a chatbot, or an automation that saves you
        hours every week? Tell me the problem — I'll design, build and launch it.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#contact">Tell me about your project</a>
        <?php if ($wa): ?>
          <a class="btn btn--ghost" href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener">WhatsApp me</a>
        <?php else: ?>
          <a class="btn btn--ghost" href="#services">See what I build</a>
        <?php endif; ?>
      </div>
      <ul class="stats">
        <li><strong>Web &amp; Mobile</strong><span>Apps that run everywhere</span></li>
        <li><strong>AI features</strong><span>Chat, search, automation</span></li>
        <li><strong>Store ready</strong><span>Play Store &amp; App Store</span></li>
      </ul>
    </div>
  </section>

  <!-- Services -->
  <section class="section" id="services">
    <div class="container">
      <h2 class="section__title">What I can build for you</h2>
      <p class="section__sub">From a single landing page to a full product with AI inside.</p>
      <div class="grid grid--3">
        <?php
        $services = [
            ['🤖', 'AI-powered apps', 'Chatbots, smart search, document Q&A, recommendations and assistants trained on your business.'],
            ['📱', 'Mobile apps', 'Android &amp; iOS apps built with Flutter or React Native — or your website wrapped and published to the stores.'],
            ['🌐', 'Websites &amp; web apps', 'Landing pages, dashboards, booking systems, e-commerce and custom portals.'],
            ['⚙️', 'Automation', 'Connect your tools, remove repetitive work, and let software handle the busywork.'],
            ['🎨', 'UI/UX design', 'Clean, modern interfaces that are easy for your customers to use.'],
            ['🚀', 'Launch &amp; publish', 'I handle the technical setup so your app goes live — Google Play, App Store and the web.'],
        ];
        foreach ($services as [$icon, $title, $desc]): ?>
          <article class="card">
            <div class="card__icon"><?= $icon ?></div>
            <h3><?= $title ?></h3>
            <p><?= $desc ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- Process -->
  <section class="section section--alt" id="process">
    <div class="container">
      <h2 class="section__title">How we'll work together</h2>
      <p class="section__sub">Simple, transparent, and built around your goals.</p>
      <ol class="steps">
        <li><span class="step__no">1</span><h3>You message me</h3><p>Tell me your idea or problem using the form below.</p></li>
        <li><span class="step__no">2</span><h3>Free plan &amp; quote</h3><p>I reply with a clear plan, timeline and price. No jargon.</p></li>
        <li><span class="step__no">3</span><h3>I build it</h3><p>You get regular updates and can give feedback along the way.</p></li>
        <li><span class="step__no">4</span><h3>Launch</h3><p>We publish to the web and/or the app stores, and I support you after.</p></li>
      </ol>
    </div>
  </section>

  <!-- Work -->
  <section class="section" id="work">
    <div class="container">
      <h2 class="section__title">Selected work</h2>
      <p class="section__sub">Replace these with your own projects and screenshots.</p>
      <div class="grid grid--3">
        <?php
        $work = [
            ['AI support assistant', 'A chatbot that answers customer questions 24/7 using the company\'s own documents.', ['AI', 'Chatbot']],
            ['Booking app', 'Customers book appointments in seconds; the owner manages everything from a phone.', ['Mobile', 'Scheduling']],
            ['Business dashboard', 'Sales, orders and reports in one clean screen, updated live.', ['Web', 'Dashboard']],
        ];
        foreach ($work as [$title, $desc, $tags]): ?>
          <article class="card card--work">
            <div class="thumb" aria-hidden="true"><span>&lt;/&gt;</span></div>
            <h3><?= e($title) ?></h3>
            <p><?= e($desc) ?></p>
            <div class="tags"><?php foreach ($tags as $t): ?><span class="tag"><?= e($t) ?></span><?php endforeach; ?></div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- App stores -->
  <section class="section section--alt" id="publish">
    <div class="container narrow">
      <h2 class="section__title">Can your app go on the Play Store &amp; App Store?</h2>
      <p class="section__sub">Yes. Here are your options — I'll recommend the right one for your budget.</p>
      <div class="compare">
        <div class="compare__col">
          <h3>🌐 Web app (PWA)</h3>
          <p>Installable straight from the browser. No store review, fastest and cheapest to launch.</p>
          <p class="muted">No store listing needed.</p>
        </div>
        <div class="compare__col compare__col--best">
          <h3>📦 Store app</h3>
          <p>Published on Google Play and the Apple App Store so people can find and install it.</p>
          <p class="muted">Google Play: $25 once &middot; Apple: $99/year.</p>
        </div>
        <div class="compare__col">
          <h3>🔁 Hybrid</h3>
          <p>Start as a web app, then wrap it for the stores when you're ready. Reuse the same code.</p>
          <p class="muted">Best value over time.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact -->
  <section class="section" id="contact">
    <div class="container narrow">
      <h2 class="section__title">Tell me about your project</h2>
      <p class="section__sub">Fill this in and I'll reply within 24 hours. Prefer to type freely? Just write it in the box.</p>

      <?php if (!$ready): ?>
        <div class="notice notice--warn">
          <strong>Setup not finished.</strong> Open
          <a href="install.php">install.php</a> once to create the database, then delete it.
        </div>
      <?php endif; ?>

      <form class="form" id="contactForm" method="post" action="contact.php" novalidate>
        <input type="hidden" name="csrf" value="<?= e($token) ?>">
        <!-- Honeypot: hidden from humans, tempting to bots -->
        <div class="hp" aria-hidden="true">
          <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>

        <div class="form__row">
          <div class="field">
            <label for="name">Your name <span aria-hidden="true">*</span></label>
            <input id="name" name="name" type="text" required autocomplete="name" placeholder="Jane Doe">
            <small class="field__error" data-for="name"></small>
          </div>
          <div class="field">
            <label for="email">Email <span aria-hidden="true">*</span></label>
            <input id="email" name="email" type="email" required autocomplete="email" placeholder="jane@company.com">
            <small class="field__error" data-for="email"></small>
          </div>
        </div>

        <div class="form__row">
          <div class="field">
            <label for="phone">Phone / WhatsApp</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="Optional">
          </div>
          <div class="field">
            <label for="company">Company / Business</label>
            <input id="company" name="company" type="text" autocomplete="organization" placeholder="Optional">
          </div>
        </div>

        <div class="form__row">
          <div class="field">
            <label for="service">What do you need?</label>
            <select id="service" name="service">
              <option value="">Choose one…</option>
              <option>AI-powered app</option>
              <option>Mobile app (Android / iOS)</option>
              <option>Website / web app</option>
              <option>Automation</option>
              <option>UI/UX design</option>
              <option>Something else</option>
            </select>
          </div>
          <div class="field">
            <label for="budget">Budget (optional)</label>
            <select id="budget" name="budget">
              <option value="">Not sure yet</option>
              <option>Under $500</option>
              <option>$500 – $1,500</option>
              <option>$1,500 – $5,000</option>
              <option>$5,000+</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="message">Tell me about it <span aria-hidden="true">*</span></label>
          <textarea id="message" name="message" rows="5" required placeholder="What do you want to build? Who is it for? What problem does it solve?"></textarea>
          <small class="field__error" data-for="message"></small>
        </div>

        <div class="form__footer">
          <button class="btn btn--primary" type="submit" id="submitBtn">Send message</button>
          <?php if ($wa): ?><a class="btn btn--ghost" href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener">WhatsApp instead</a><?php endif; ?>
          <?php if ($tg): ?><a class="btn btn--ghost" href="https://t.me/<?= e($tg) ?>" target="_blank" rel="noopener">Telegram</a><?php endif; ?>
        </div>

        <div class="form__status" id="formStatus" role="status" aria-live="polite"></div>
      </form>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container footer__inner">
    <p>&copy; <?= e($year) ?> <?= e($brand) ?> &middot; <?= e($name) ?>, <?= e($cfg['tagline']) ?></p>
    <p><a href="admin.php">Admin</a> &middot; Built with PHP &amp; MySQL</p>
  </div>
</footer>

<script src="assets/app.js" defer></script>
</body>
</html>
