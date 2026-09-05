PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_votes` (
	`fingerprint_hash` text(64) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "fingerprint_hash_length" CHECK(length("__new_votes"."fingerprint_hash") = 64)
);
--> statement-breakpoint
INSERT INTO `__new_votes`("fingerprint_hash", "created_at") SELECT "fingerprint_hash", "created_at" FROM `votes`;--> statement-breakpoint
DROP TABLE `votes`;--> statement-breakpoint
ALTER TABLE `__new_votes` RENAME TO `votes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;