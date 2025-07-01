/*
  Warnings:

  - Added the required column `tipo` to the `Metricas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMetrica" AS ENUM ('CompreensaoTextual', 'ClarezaResposta');

-- AlterTable
ALTER TABLE "Metricas" ADD COLUMN     "tipo" "TipoMetrica" NOT NULL;
