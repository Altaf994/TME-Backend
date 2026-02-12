/*
  Warnings:

  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ClassToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClassToUser" DROP CONSTRAINT "_ClassToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassToUser" DROP CONSTRAINT "_ClassToUser_B_fkey";

-- DropTable
DROP TABLE "Class";

-- DropTable
DROP TABLE "_ClassToUser";

-- CreateTable
CREATE TABLE "CoreQuestion" (
    "id" SERIAL NOT NULL,
    "serial" INTEGER,
    "A" TEXT,
    "B" TEXT,
    "C" TEXT,
    "D" TEXT,
    "E" TEXT,
    "F" TEXT,
    "G" TEXT,
    "H" TEXT,
    "I" TEXT,
    "J" TEXT,
    "K" TEXT,
    "L" TEXT,
    "M" TEXT,
    "N" TEXT,
    "O" TEXT,
    "P" TEXT,
    "Q" TEXT,
    "R" TEXT,
    "S" TEXT,
    "T" TEXT,
    "answer" TEXT NOT NULL,
    "complexity" INTEGER,
    "length" INTEGER,

    CONSTRAINT "CoreQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedQuestion" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "userId" INTEGER,
    "section" TEXT,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssignedQuestion" ADD CONSTRAINT "AssignedQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedQuestion" ADD CONSTRAINT "AssignedQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CoreQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
