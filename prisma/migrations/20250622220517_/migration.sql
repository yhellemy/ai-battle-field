/*
  Warnings:

  - Changed the type of `tipoResultado` on the `Resultados` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Resultados" DROP COLUMN "tipoResultado",
ADD COLUMN     "tipoResultado" "TipoMetrica" NOT NULL;

-- DropEnum
DROP TYPE "TipoResultado";
