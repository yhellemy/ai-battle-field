/*
  Warnings:

  - Changed the type of `gabarito` on the `BancoDeQuestoes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "BancoDeQuestoes" DROP CONSTRAINT "BancoDeQuestoes_metricaId_fkey";

-- DropForeignKey
ALTER TABLE "Modelos" DROP CONSTRAINT "Modelos_provedorId_fkey";

-- AlterTable
ALTER TABLE "BancoDeQuestoes" DROP COLUMN "gabarito",
ADD COLUMN     "gabarito" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "BancoDeQuestoes" ADD CONSTRAINT "BancoDeQuestoes_metricaId_fkey" FOREIGN KEY ("metricaId") REFERENCES "Metricas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modelos" ADD CONSTRAINT "Modelos_provedorId_fkey" FOREIGN KEY ("provedorId") REFERENCES "Provedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
