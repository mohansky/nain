CREATE TABLE `user` (
    `id` text PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `email` text NOT NULL,
    `emailVerified` integer DEFAULT false NOT NULL,
    `image` text,
    `createdAt` integer NOT NULL,
    `updatedAt` integer NOT NULL
);

CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);

CREATE TABLE `session` (
    `id` text PRIMARY KEY NOT NULL,
    `expiresAt` integer NOT NULL,
    `token` text NOT NULL,
    `createdAt` integer NOT NULL,
    `updatedAt` integer NOT NULL,
    `ipAddress` text,
    `userAgent` text,
    `userId` text NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);

CREATE TABLE `account` (
    `id` text PRIMARY KEY NOT NULL,
    `accountId` text NOT NULL,
    `providerId` text NOT NULL,
    `userId` text NOT NULL,
    `accessToken` text,
    `refreshToken` text,
    `idToken` text,
    `accessTokenExpiresAt` integer,
    `refreshTokenExpiresAt` integer,
    `scope` text,
    `password` text,
    `createdAt` integer NOT NULL,
    `updatedAt` integer NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `verification` (
    `id` text PRIMARY KEY NOT NULL,
    `identifier` text NOT NULL,
    `value` text NOT NULL,
    `expiresAt` integer NOT NULL,
    `createdAt` integer,
    `updatedAt` integer
);


ALTER TABLE user_profile ADD COLUMN avatar TEXT;