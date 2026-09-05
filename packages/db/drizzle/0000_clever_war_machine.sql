CREATE TABLE `signature_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signatures` (
	`fingerprint_hash` text(64) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "fingerprint_hash_length" CHECK(length("signatures"."fingerprint_hash") = 64)
);
--> statement-breakpoint
-- Singleton tally row; live signs and hourly reconcile both expect id = 1.
INSERT OR IGNORE INTO `signature_stats` (`id`, `count`) VALUES (1, 0);
