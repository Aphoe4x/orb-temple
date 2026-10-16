<?php
/**
 * Configuration for the App Studio site.
 *
 * EDIT these values before going live.
 */
return [
    // --- Branding shown across the site -------------------------------
    'site_name'   => 'App Studio',
    'owner_name'  => 'Your Name',
    'tagline'     => 'AI Product Engineer',
    'email'       => 'you@example.com',      // where contact notifications are sent
    'whatsapp'    => '',                     // digits only, e.g. 2348012345678 (leave '' to hide)
    'telegram'    => '',                     // username without @, e.g. myusername (leave '' to hide)

    // --- Database (matches a default XAMPP install) -------------------
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'name'    => 'app_studio',
        'user'    => 'root',
        'pass'    => '',
        'charset' => 'utf8mb4',
    ],

    // --- Admin area (admin.php) ---------------------------------------
    // CHANGE THIS before deploying anywhere public.
    'admin_password' => 'change-me-now',
];
