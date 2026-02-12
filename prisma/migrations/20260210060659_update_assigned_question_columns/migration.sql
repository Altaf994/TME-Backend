/*
  Warnings:

  - You are about to drop the column `questionId` on the `AssignedQuestion` table. All the data in the column will be lost.
  - Added the required column `answer` to the `AssignedQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssignedQuestion" DROP CONSTRAINT "AssignedQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "AssignedQuestion" DROP CONSTRAINT "AssignedQuestion_userId_fkey";

-- AlterTable
ALTER TABLE "AssignedQuestion" DROP COLUMN "questionId",
ADD COLUMN     "A" TEXT,
ADD COLUMN     "B" TEXT,
ADD COLUMN     "C" TEXT,
ADD COLUMN     "D" TEXT,
ADD COLUMN     "E" TEXT,
ADD COLUMN     "F" TEXT,
ADD COLUMN     "G" TEXT,
ADD COLUMN     "H" TEXT,
ADD COLUMN     "I" TEXT,
ADD COLUMN     "J" TEXT,
ADD COLUMN     "K" TEXT,
ADD COLUMN     "L" TEXT,
ADD COLUMN     "M" TEXT,
ADD COLUMN     "N" TEXT,
ADD COLUMN     "O" TEXT,
ADD COLUMN     "P" TEXT,
ADD COLUMN     "Q" TEXT,
ADD COLUMN     "R" TEXT,
ADD COLUMN     "S" TEXT,
ADD COLUMN     "T" TEXT,
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "complexity" INTEGER,
ADD COLUMN     "length" INTEGER,
ADD COLUMN     "serial" INTEGER;
