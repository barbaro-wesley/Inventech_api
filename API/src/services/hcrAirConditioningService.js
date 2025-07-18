const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrAirConditioningService {
  async criar(data) {
    return await prisma.hcrAirConditioning.create({ data });
  }

  async listar() {
    return await prisma.hcrAirConditioning.findMany({
      include: {
        setor: true,
        localizacao: true,
        tipoEquipamento: true,
      }
    });
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
