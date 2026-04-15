-- CreateTable
CREATE TABLE "ResetPassWord" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numberVerification" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ResetPassWord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResetPassWord" ADD CONSTRAINT "ResetPassWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
