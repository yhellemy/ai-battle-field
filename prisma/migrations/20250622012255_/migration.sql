/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Modelos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Modelos_nome_key" ON "Modelos"("nome");
