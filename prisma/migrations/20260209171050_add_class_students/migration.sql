-- CreateTable
CREATE TABLE "_ClassToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClassToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClassToUser_B_index" ON "_ClassToUser"("B");

-- AddForeignKey
ALTER TABLE "_ClassToUser" ADD CONSTRAINT "_ClassToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToUser" ADD CONSTRAINT "_ClassToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
