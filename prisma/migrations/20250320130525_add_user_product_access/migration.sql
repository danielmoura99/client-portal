-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "immediateAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "releaseAfterDays" INTEGER;

-- CreateTable
CREATE TABLE "UserProductAccessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "accessGrantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProductAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProductAccessLog_userId_productId_idx" ON "UserProductAccessLog"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProductAccessLog_userId_productId_key" ON "UserProductAccessLog"("userId", "productId");

-- AddForeignKey
ALTER TABLE "UserProductAccessLog" ADD CONSTRAINT "UserProductAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProductAccessLog" ADD CONSTRAINT "UserProductAccessLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
