/*
  Warnings:

  - A unique constraint covering the columns `[provedorId,nome]` on the table `Modelos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Modelos_id_provedorId_nome_key";

-- CreateIndex
CREATE UNIQUE INDEX "Modelos_provedorId_nome_key" ON "Modelos"("provedorId", "nome");
