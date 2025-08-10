const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrAirConditioningService {
  async criar(data) {
  if (!Array.isArray(data.arquivos)) {
    data.arquivos = [];
  }
  return await prisma.hcrAirConditioning.create({ data });
}

  async listar() {
  const condicionadores = await prisma.hcrAirConditioning.findMany({
    include: {
      setor: true,
      localizacao: true,
      tipoEquipamento: true,
    }
  });

  const condicionadoresComOS = await Promise.all(
    condicionadores.map(async (ar) => {
      const ordensServico = await prisma.ordemServico.findMany({
        where: { equipamentoId: ar.id },
        include: {
          tecnico: true,
          solicitante: true,
          tipoEquipamento: true,
          Setor: true,
        }
      });
      return {
        ...ar,
        ordensServico,
      };
    })
  );

  return condicionadoresComOS;
}

  async buscarPorId(id) {
    return await prisma.hcrAirConditioning.findUnique({
      where: { id },
      include: {
        setor: true,
        localizacao: true,
        tipoEquipamento: true,
      }
    });
  }

  async atualizar(id, data) {
    return await prisma.hcrAirConditioning.update({
      where: { id },
      data,
    });
  }

  async deletar(id) {
    return await prisma.hcrAirConditioning.delete({
      where: { id },
    });
  }
}

module.exports = new HcrAirConditioningService();
