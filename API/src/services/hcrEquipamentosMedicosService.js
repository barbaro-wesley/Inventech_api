const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrEquipamentosMedicosService {
  async criar(data) {
    return await prisma.hcrEquipamentosMedicos.create({ data });
  }

  async listar() {
    return await prisma.hcrEquipamentosMedicos.findMany({
      include: { setor: true, localizacao: true },
    });
  }

  async buscarPorId(id) {
    return await prisma.hcrEquipamentosMedicos.findUnique({
      where: { id: Number(id) },
      include: { setor: true, localizacao: true },
    });
  }

  async atualizar(id, data) {
    return await prisma.hcrEquipamentosMedicos.update({
      where: { id: Number(id) },
      data,
    });
  }

  async deletar(id) {
    return await prisma.hcrEquipamentosMedicos.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new HcrEquipamentosMedicosService();
