-- AlterTable
ALTER TABLE "Resultados" ADD COLUMN     "erro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jsonErro" JSONB;
