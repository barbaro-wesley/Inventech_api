const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const localizacaoService = {
  async criar(data) {
    const setor = await prisma.setor.findUnique({
      where: { id: data.setorId }
    });

    if (!setor) throw new Error('Setor não encontrado');

    const localizacao = await prisma.localizacao.create({
      data: {
        nome: data.nome,
        setorId: data.setorId
      }
    });

    return localizacao;
  },

  async listar() {
    return prisma.localizacao.findMany({
      include: {
        setor: true
      }
    });
  }
};

module.exports = localizacaoService;
