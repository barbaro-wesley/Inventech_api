const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const setorService = {
  async criar(data) {
    const setor = await prisma.setor.create({
      data: {
        nome: data.nome,
      }
    });
    return setor;
  },

  async listar() {
    return prisma.setor.findMany({
      include: {
        localizacoes: true,
      }
    });
  }
};

module.exports = setorService;
