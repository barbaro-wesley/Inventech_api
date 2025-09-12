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
  },
  async editar(id, data) {
    const setorExiste = await prisma.setor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!setorExiste) {
      throw new Error('Setor não encontrado');
    }

    const setor = await prisma.setor.update({
      where: { id: parseInt(id) },
      data: {
        nome: data.nome,
      },
      include: {
        localizacoes: true,
      }
    });
    return setor;
  },
  async excluir(id) {
    const setorExiste = await prisma.setor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!setorExiste) {
      throw new Error('Setor não encontrado');
    }

    // Verifica se existe localizações associadas
    const localizacoesAssociadas = await prisma.localizacao.count({
      where: { setorId: parseInt(id) }
    });

    if (localizacoesAssociadas > 0) {
      throw new Error('Não é possível excluir o setor pois existem localizações associadas a ele');
    }

    await prisma.setor.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Setor excluído com sucesso' };
  }
};

module.exports = setorService;
