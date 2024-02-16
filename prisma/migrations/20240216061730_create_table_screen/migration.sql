-- CreateTable
CREATE TABLE "Screen" (
    "id" SERIAL NOT NULL,
    "cinema_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "column_size" INTEGER NOT NULL,
    "row_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_cinema_id_fkey" FOREIGN KEY ("cinema_id") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
