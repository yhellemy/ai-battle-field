-- DropForeignKey
ALTER TABLE "public"."Indicadores" DROP CONSTRAINT "Indicadores_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resultados" DROP CONSTRAINT "Resultados_modeloId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Resultados" ADD CONSTRAINT "Resultados_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "public"."Modelos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Indicadores" ADD CONSTRAINT "Indicadores_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "public"."Modelos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
