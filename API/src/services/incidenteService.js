const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const incidenteService = {
  async criar(data) {
    return prisma.incidente.create({ data });
  },

  async listar() {
    return prisma.incidente.findMany({ orderBy: { criadoEm: 'desc' } });
  },

  async buscarPorId(id) {
    return prisma.incidente.findUnique({ where: { id: Number(id) } });
  },

  async atualizar(id, data) {
    return prisma.incidente.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deletar(id) {
    return prisma.incidente.delete({ where: { id: Number(id) } });
  }
};

module.exports = incidenteService;
