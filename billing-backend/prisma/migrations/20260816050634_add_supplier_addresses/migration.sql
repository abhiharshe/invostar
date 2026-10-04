-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `billingAddress` JSON NULL,
    ADD COLUMN `gstin` VARCHAR(191) NULL,
    ADD COLUMN `shippingAddress` JSON NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `category` ENUM('PHYSICAL_GOODS', 'DIGITAL_GOODS', 'SERVICES', 'LABOR') NOT NULL DEFAULT 'PHYSICAL_GOODS',
    ADD COLUMN `isBundle` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Purchase` MODIFY `status` ENUM('DRAFT', 'QUOTATION', 'CONVERTED', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'VOIDED') NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `isQuotation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `quotationId` VARCHAR(191) NULL,
    MODIFY `status` ENUM('DRAFT', 'QUOTATION', 'CONVERTED', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'VOIDED') NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `billingAddress` JSON NULL,
    ADD COLUMN `deliveryAddress` JSON NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `refreshTokenHash` TEXT NULL;

-- CreateTable
CREATE TABLE `BundleItem` (
    `id` VARCHAR(191) NOT NULL,
    `bundleProductId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(15, 3) NOT NULL DEFAULT 1,
    `rate` DECIMAL(15, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BundleItem_bundleProductId_idx`(`bundleProductId`),
    INDEX `BundleItem_productId_idx`(`productId`),
    UNIQUE INDEX `BundleItem_bundleProductId_productId_key`(`bundleProductId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Customer_gstin_idx` ON `Customer`(`gstin`);

-- CreateIndex
CREATE INDEX `Product_category_idx` ON `Product`(`category`);

-- CreateIndex
CREATE INDEX `Product_isBundle_idx` ON `Product`(`isBundle`);

-- CreateIndex
CREATE INDEX `Sale_isQuotation_idx` ON `Sale`(`isQuotation`);

-- AddForeignKey
ALTER TABLE `BundleItem` ADD CONSTRAINT `BundleItem_bundleProductId_fkey` FOREIGN KEY (`bundleProductId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BundleItem` ADD CONSTRAINT `BundleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
