const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sobreavisoService = {
  async criar(data) {
    return await prisma.sobreaviso.create({ data });
  },

  async listarTodos() {
    return await prisma.sobreaviso.findMany({
      orderBy: { data: 'desc' },
    });
  },

  async buscarPorId(id) {
    return await prisma.sobreaviso.findUnique({
      where: { id: Number(id) },
    });
  },

  async atualizar(id, data) {
    return await prisma.sobreaviso.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deletar(id) {
    return await prisma.sobreaviso.delete({
      where: { id: Number(id) },
    });
  },
};

module.exports = sobreavisoService;
