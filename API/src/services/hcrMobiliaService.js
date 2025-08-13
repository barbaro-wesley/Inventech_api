const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calcularValorDepreciado(valorCompra, taxaDepreciacao, dataCompra) {
  if (!valorCompra || !taxaDepreciacao || !dataCompra) return valorCompra;
  const dataHoje = new Date();
  const compra = new Date(dataCompra);
  const diffTempo = dataHoje.getTime() - compra.getTime();
  const anosPassados = diffTempo / (1000 * 60 * 60 * 24 * 365);
  const taxaDecimal = taxaDepreciacao / 100;
  const depreciacaoTotal = valorCompra * taxaDecimal * anosPassados;
  const valorFinal = valorCompra - depreciacaoTotal;
  return valorFinal < 0 ? 0 : parseFloat(valorFinal.toFixed(2));
}
class HcrMobiliaService {
  async criar(data) {
    const taxaDepreciacao = 10; // fixa 10%
    const valorAtual = calcularValorDepreciado(
      Number(data.valorCompra),
      taxaDepreciacao,
      data.dataCompra
    );

    return prisma.hcrMobilia.create({
      data: {
        nPatrimonio: data.nPatrimonio,
        nome: data.nome,
        estado: data.estado,
        obs: data.obs,
        valorCompra: data.valorCompra ? Number(data.valorCompra) : null,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : null,
        taxaDepreciacao,
        valorAtual,
        tipoEquipamentoId: Number(data.tipoEquipamentoId),
        localizacaoId: Number(data.localizacaoId),
        setorId: Number(data.setorId),
      },
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true,
      },
    });
  }

  async listar() {
    return prisma.hcrMobilia.findMany({
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true,
      },
    });
  }

  async buscarPorId(id) {
    return prisma.hcrMobilia.findUnique({
      where: { id: Number(id) },
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true,
      },
    });
  }

  async atualizar(id, data) {
    const taxaDepreciacao = 10; // fixa 10%
    let valorAtual;

    if (data.valorCompra && data.dataCompra) {
      valorAtual = calcularValorDepreciado(
        Number(data.valorCompra),
        taxaDepreciacao,
        data.dataCompra
      );
    }

    return prisma.hcrMobilia.update({
      where: { id: Number(id) },
      data: {
        ...data,
        valorCompra: data.valorCompra ? Number(data.valorCompra) : undefined,
        taxaDepreciacao,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : undefined,
        valorAtual: valorAtual ?? undefined,
      },
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true,
      },
    });
  }

  async deletar(id) {
    return prisma.hcrMobilia.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new HcrMobiliaService();
