-- AlterTable
ALTER TABLE `User` MODIFY `googleId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `facebookId` VARCHAR(191) NULL,
ADD COLUMN `discordId` VARCHAR(191) NULL,
ADD COLUMN `githubId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_facebookId_key` ON `User`(`facebookId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_discordId_key` ON `User`(`discordId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_githubId_key` ON `User`(`githubId`);
