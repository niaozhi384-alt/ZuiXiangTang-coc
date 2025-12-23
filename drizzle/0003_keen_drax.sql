CREATE TABLE `hitokoto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`source` varchar(200),
	`author` varchar(100),
	`type` varchar(50),
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `hitokoto_id` PRIMARY KEY(`id`)
);
