CREATE TABLE `academy_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` varchar(32) NOT NULL,
	`name` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`university_id` int,
	`location` varchar(255) NOT NULL DEFAULT '',
	`degree` varchar(255) NOT NULL DEFAULT '',
	`category` varchar(255) NOT NULL DEFAULT '',
	`verified` boolean NOT NULL DEFAULT false,
	`data` json NOT NULL DEFAULT (JSON_OBJECT()),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `academy_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_content_kind_slug_idx` UNIQUE(`kind`,`slug`),
	CONSTRAINT `academy_content_kind_check` CHECK(`academy_content`.`kind` in ('universities','programs','courses','blogs','faqs','pages','media','seo','settings','homepage','industry_companies','certifications','testimonials')),
	CONSTRAINT `academy_content_status_check` CHECK(`academy_content`.`status` in ('published','draft','archived'))
);
--> statement-breakpoint
CREATE TABLE `academy_admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(32) NOT NULL DEFAULT 'admin',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `academy_admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `academy_sessions` (
	`token_hash` varchar(64) NOT NULL,
	`admin_id` int NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	CONSTRAINT `academy_sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `academy_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`phone_country` text NOT NULL DEFAULT (''),
	`consent` boolean NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'contact',
	`university` text NOT NULL DEFAULT (''),
	`program` text NOT NULL DEFAULT (''),
	`course` text NOT NULL DEFAULT (''),
	`interested_in` text NOT NULL DEFAULT (''),
	`qualification` text NOT NULL DEFAULT (''),
	`city` text NOT NULL DEFAULT (''),
	`preferred_date` text NOT NULL DEFAULT (''),
	`preferred_time` text NOT NULL DEFAULT (''),
	`time_zone` text NOT NULL DEFAULT (''),
	`content_id` int,
	`source` text NOT NULL DEFAULT ('website'),
	`utm` text NOT NULL DEFAULT (''),
	`message` text NOT NULL DEFAULT (''),
	`status` varchar(64) NOT NULL DEFAULT 'New',
	`notes` text NOT NULL DEFAULT (''),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `academy_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_leads_status_check` CHECK(`academy_leads`.`status` in ('New','Contacted','Interested','Application Started','Applied','Admission Confirmed','Closed'))
);
--> statement-breakpoint
ALTER TABLE `academy_content` ADD CONSTRAINT `academy_content_university_fk` FOREIGN KEY (`university_id`) REFERENCES `academy_content`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `academy_sessions` ADD CONSTRAINT `academy_sessions_admin_id_academy_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `academy_admins`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `academy_leads` ADD CONSTRAINT `academy_leads_content_id_academy_content_id_fk` FOREIGN KEY (`content_id`) REFERENCES `academy_content`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `academy_content_status_featured_idx` ON `academy_content` (`kind`,`status`,`featured`);--> statement-breakpoint
CREATE INDEX `academy_content_university_idx` ON `academy_content` (`university_id`);--> statement-breakpoint
CREATE INDEX `academy_content_location_degree_idx` ON `academy_content` (`location`,`degree`);--> statement-breakpoint
CREATE INDEX `academy_sessions_expiry_idx` ON `academy_sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `academy_leads_status_idx` ON `academy_leads` (`status`);--> statement-breakpoint
CREATE INDEX `academy_leads_category_date_idx` ON `academy_leads` (`category`,`created_at`);