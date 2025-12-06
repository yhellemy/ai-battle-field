/*
  Warnings:

  - Changed the type of `nome` on the `Provedores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Provedores" DROP COLUMN "nome",
ADD COLUMN     "nome" "Provider" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Provedores_nome_key" ON "Provedores"("nome");
