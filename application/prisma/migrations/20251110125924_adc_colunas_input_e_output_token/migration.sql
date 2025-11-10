/*
  Warnings:

  - Added the required column `inputTokens` to the `Resultados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outputTokens` to the `Resultados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Resultados" ADD COLUMN     "inputTokens" INTEGER NOT NULL,
ADD COLUMN     "outputTokens" INTEGER NOT NULL;
