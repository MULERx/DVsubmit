/*
  Warnings:

  - Made the column `phoneNumber` on table `applications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
