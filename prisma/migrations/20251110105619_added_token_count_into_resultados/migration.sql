/*
  Warnings:

  - Added the required column `totalTokens` to the `Resultados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Resultados" ADD COLUMN     "totalTokens" INTEGER NOT NULL;
