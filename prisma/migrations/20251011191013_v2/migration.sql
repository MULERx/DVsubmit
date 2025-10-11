/*
  Warnings:

  - The values [CONFIRMED,EXPIRED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `paymentStatus` on the `applications` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'PAYMENT_REJECTED', 'APPLICATION_REJECTED', 'SUBMITTED');
ALTER TABLE "public"."applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'PAYMENT_PENDING';
COMMIT;

-- DropIndex
DROP INDEX "public"."applications_paymentStatus_idx";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "paymentStatus";

-- DropEnum
DROP TYPE "public"."PaymentStatus";
