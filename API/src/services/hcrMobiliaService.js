const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrMobiliaService {
  async criar(data) {
    return prisma.hcrMobilia.create({
      data,
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true
      }
    });
  }

  async listar() {
    return prisma.hcrMobilia.findMany({
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true
      }
    });
  }

  async buscarPorId(id) {
    return prisma.hcrMobilia.findUnique({
      where: { id: Number(id) },
      include: {
        localizacao: true,
        setor: true,
        tipoEquipamento: true
      }
    });
  }

  async atualizar(id, data) {
    return prisma.hcrMobilia.update({
      where: { id: Number(id) },
      data,
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
