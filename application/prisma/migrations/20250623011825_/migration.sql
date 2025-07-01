/*
  Warnings:

  - A unique constraint covering the columns `[bancoDeQuestoesId,modeloId]` on the table `Resultados` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Resultados_id_bancoDeQuestoesId_modeloId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Resultados_bancoDeQuestoesId_modeloId_key" ON "Resultados"("bancoDeQuestoesId", "modeloId");
