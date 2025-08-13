const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calcularValorDepreciado(valorCompra, taxaDepreciacao, dataCompra) {
  if (!valorCompra || !taxaDepreciacao || !dataCompra) return valorCompra;

  const anosPassados = (new Date() - new Date(dataCompra)) / (1000 * 60 * 60 * 24 * 365);
  const valorFinal = valorCompra * Math.pow((1 - taxaDepreciacao / 100), anosPassados);

  return valorFinal < 0 ? 0 : parseFloat(valorFinal.toFixed(2));
}

class HcrMobiliaService {
  async criar(data) {
    return prisma.hcrMobilia.create({
      data: {
        nPatrimonio: data.nPatrimonio,
        nome: data.nome,
        estado: data.estado,
        obs: data.obs,
        valorCompra: data.valorCompra ? Number(data.valorCompra) : null,
        taxaDepreciacao: data.taxaDepreciacao ? Number(data.taxaDepreciacao) : null,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : null,
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
    const mobilias = await prisma.hcrMobilia.findMany({
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true
      }
    });

    return mobilias.map(m => ({
      ...m,
      valorAtual: calcularValorDepreciado(m.valorCompra, m.taxaDepreciacao, m.dataCompra)
    }));
  }

  async buscarPorId(id) {
    const mobilia = await prisma.hcrMobilia.findUnique({
      where: { id: Number(id) },
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true
      }
    });

    if (!mobilia) return null;

    return {
      ...mobilia,
      valorAtual: calcularValorDepreciado(mobilia.valorCompra, mobilia.taxaDepreciacao, mobilia.dataCompra)
    };
  }

  async atualizar(id, data) {
    return prisma.hcrMobilia.update({
      where: { id: Number(id) },
      data: {
        ...data,
        valorCompra: data.valorCompra ? Number(data.valorCompra) : undefined,
        taxaDepreciacao: data.taxaDepreciacao ? Number(data.taxaDepreciacao) : undefined,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : undefined,
      },
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true
      }
    });
  }

  async deletar(id) {
    return prisma.hcrMobilia.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new HcrMobiliaService();
