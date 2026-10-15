DROP INDEX `academy_content_location_degree_idx` ON `academy_content`;--> statement-breakpoint
ALTER TABLE `academy_content` MODIFY COLUMN `location` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_content` MODIFY COLUMN `degree` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_content` MODIFY COLUMN `category` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `phone_country` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `university` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `program` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `course` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `interested_in` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `qualification` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `city` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `preferred_date` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `preferred_time` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `time_zone` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `utm` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `message` longtext NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `academy_leads` MODIFY COLUMN `notes` longtext NOT NULL DEFAULT ('');