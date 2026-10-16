# App Studio — landing page + client contact form

A small PHP + MySQL site where potential clients land and **send you a message**.
Every message is saved to the database, emailed to you (when mail is configured),
and also written to a local log so a lead is never lost.

## What's inside

| File | Purpose |
|------|---------|
| `index.php`    | The landing page (hero, services, process, work, app-store info, contact form) |
| `contact.php`  | Handles the form: validates, saves to MySQL, emails you, returns JSON |
| `admin.php`    | Password-protected dashboard to read/manage leads |
| `install.php`  | One-time setup: creates the database + `leads` table |
| `config.php`   | **Edit me:** your name, email, WhatsApp/Telegram, DB + admin password |
| `db.php`       | Shared database connection + helpers |
| `assets/`      | CSS and JavaScript |
| `setup.sql`    | Same schema as `install.php`, for phpMyAdmin users |
| `logs/`        | Auto-created fallback copy of every lead |

## Setup (XAMPP on Windows)

1. **Start Apache + MySQL** in the XAMPP Control Panel.
2. Open <http://localhost/app-studio/install.php> in your browser → creates the database.
3. **Delete `install.php`** after setup.
4. Open <http://localhost/app-studio/> — the site is live.
5. Open <http://localhost/app-studio/admin.php> and log in with the password from `config.php`.

## Make it yours

Edit `config.php`:

- `owner_name`, `site_name`, `tagline` — your branding.
- `email` — where new-lead notifications are sent.
- `whatsapp` — digits only, e.g. `2348012345678` (leave `''` to hide the button).
- `telegram` — username without `@` (optional).
- `admin_password` — **change this**.
- `db` — only change if your MySQL credentials differ from the XAMPP defaults (`root` / empty password).

Then edit `index.php` to replace the placeholder **Selected work** cards with your real projects.

## About email on XAMPP

PHP's `mail()` rarely works on a default Windows XAMPP install because there's no
mail server. Two options:

- **Quick test:** sendmail settings in `C:\xampp\php\php.ini` + `sendmail.ini`
  (`smtp_server=smtp.gmail.com`, your Gmail address + an [App Password]).
- **Recommended for real use:** swap the `mail()` call in `contact.php` for an SMTP
  library such as [PHPMailer](https://github.com/PHPMailer/PHPMailer) with a
  Gmail/Brevo/Resend account.

**Either way, leads are still saved to the database and `logs/leads.log`,** so nothing is lost.

## Going live (publishing to the web)

This is plain PHP, so any cheap PHP host works (Hostinger, Namecheap, cPanel, etc.):

1. Upload the `app-studio` folder via FTP / File Manager.
2. Create a MySQL database in cPanel and put its details in `config.php`.
3. Visit `/install.php` once, then delete it.
4. Serve it over **HTTPS** (most hosts do this free with Let's Encrypt).

## Security notes

- Passwords use constant-time comparison; the form uses CSRF tokens and a honeypot.
- `.htaccess` blocks direct access to `.log`/`.sql`/`.md` files and the `logs/` folder.
- Basic flood protection limits 5 messages per IP per 10 minutes.
- **Before deploying publicly:** change `admin_password`, and consider renaming
  `admin.php` to something unguessable.
