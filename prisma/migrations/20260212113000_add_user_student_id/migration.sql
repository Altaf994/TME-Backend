-- Add nullable unique studentId column to User
ALTER TABLE "User" ADD COLUMN "studentId" VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS "User_studentId_unique" ON "User" ("studentId");
