-- Optional: run this in phpMyAdmin if you prefer not to use install.php.
-- (install.php does the same thing automatically.)

CREATE DATABASE IF NOT EXISTS `app_studio`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `app_studio`;

CREATE TABLE IF NOT EXISTS `leads` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
