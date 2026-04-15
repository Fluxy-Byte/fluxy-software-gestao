/*
  Warnings:

  - You are about to drop the column `banned` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "banned",
DROP COLUMN "emailVerified",
DROP COLUMN "image";

-- CreateTable
CREATE TABLE "history_transfer_ticket" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nameUser" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "nameAction" TEXT NOT NULL,
    "typeAction" TEXT NOT NULL DEFAULT 'team',
    "result" TEXT,

    CONSTRAINT "history_transfer_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_transfer" (
    "id" SERIAL NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sequentialId" INTEGER NOT NULL,
    "queueStart" TEXT,
    "queueEnd" TEXT,
    "attendenceStart" TEXT,
    "attendenceEnd" TEXT,
    "result" TEXT,
    "motive" TEXT,
    "historyId" INTEGER NOT NULL,

    CONSTRAINT "ticket_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorsLogs" (
    "id" SERIAL NOT NULL,
    "localization" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdError" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenBuilder" TEXT NOT NULL,
    "tokenRouter" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ErrorsLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ticket_transfer" ADD CONSTRAINT "ticket_transfer_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "history_transfer_ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
