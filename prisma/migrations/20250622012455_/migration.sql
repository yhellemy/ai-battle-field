/*
  Warnings:

  - A unique constraint covering the columns `[id,provedorId,nome]` on the table `Modelos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Modelos_id_provedorId_key";

-- DropIndex
DROP INDEX "Modelos_nome_key";

-- CreateIndex
CREATE UNIQUE INDEX "Modelos_id_provedorId_nome_key" ON "Modelos"("id", "provedorId", "nome");
