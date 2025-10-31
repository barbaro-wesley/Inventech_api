-- AlterTable
ALTER TABLE "HcrMobilia" ADD COLUMN     "dataCompra" TIMESTAMP(3),
ADD COLUMN     "inicioGarantia" TIMESTAMP(3),
ADD COLUMN     "notaFiscal" TEXT,
ADD COLUMN     "taxaDepreciacao" DOUBLE PRECISION,
ADD COLUMN     "terminoGarantia" TIMESTAMP(3),
ADD COLUMN     "valorCompra" DOUBLE PRECISION;
