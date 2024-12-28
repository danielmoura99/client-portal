-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
