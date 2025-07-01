-- CreateEnum
CREATE TYPE "TipoResultado" AS ENUM ('Porcentagem', 'Numero');

-- CreateTable
CREATE TABLE "BancoDeQuestoes" (
    "id" SERIAL NOT NULL,
    "metricaId" INTEGER NOT NULL,
    "pergunta" JSONB NOT NULL,
    "gabarito" TEXT NOT NULL,

    CONSTRAINT "BancoDeQuestoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metricas" (
    "id" SERIAL NOT NULL,
    "metricas" TEXT NOT NULL,

    CONSTRAINT "Metricas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provedores" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Provedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modelos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "provedorId" INTEGER NOT NULL,

    CONSTRAINT "Modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resultados" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "tipoResultado" "TipoResultado" NOT NULL,
    "jsonResultado" JSONB,
    "bancoDeQuestoesId" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,

    CONSTRAINT "Resultados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicadores" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "indicador" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "metricaId" INTEGER NOT NULL,

    CONSTRAINT "Indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BancoDeQuestoes_id_metricaId_key" ON "BancoDeQuestoes"("id", "metricaId");

-- CreateIndex
CREATE UNIQUE INDEX "Provedores_nome_key" ON "Provedores"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Modelos_id_provedorId_key" ON "Modelos"("id", "provedorId");

-- CreateIndex
CREATE UNIQUE INDEX "Resultados_id_bancoDeQuestoesId_modeloId_key" ON "Resultados"("id", "bancoDeQuestoesId", "modeloId");

-- CreateIndex
CREATE UNIQUE INDEX "Indicadores_id_modeloId_metricaId_key" ON "Indicadores"("id", "modeloId", "metricaId");

-- AddForeignKey
ALTER TABLE "BancoDeQuestoes" ADD CONSTRAINT "BancoDeQuestoes_metricaId_fkey" FOREIGN KEY ("metricaId") REFERENCES "Metricas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modelos" ADD CONSTRAINT "Modelos_provedorId_fkey" FOREIGN KEY ("provedorId") REFERENCES "Provedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultados" ADD CONSTRAINT "Resultados_bancoDeQuestoesId_fkey" FOREIGN KEY ("bancoDeQuestoesId") REFERENCES "BancoDeQuestoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultados" ADD CONSTRAINT "Resultados_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicadores" ADD CONSTRAINT "Indicadores_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicadores" ADD CONSTRAINT "Indicadores_metricaId_fkey" FOREIGN KEY ("metricaId") REFERENCES "Metricas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
