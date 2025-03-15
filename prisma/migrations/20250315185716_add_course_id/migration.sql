/*
  Warnings:

  - A unique constraint covering the columns `[courseId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "courseId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_courseId_key" ON "Product"("courseId");
