const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const chamadoService = {
  async criar(data) {
    // Gera o número do chamado com base no último + 1
    const ultimo = await prisma.chamado.findFirst({
      orderBy: { numero: 'desc' },
    });

    const numero = ultimo ? ultimo.numero + 1 : 1;

    return await prisma.chamado.create({
      data: {
        ...data,
        numero,
      },
    });
  },

  async listarTodos() {
    return await prisma.chamado.findMany({
      include: { Sistema: true },
      orderBy: { dataCriacao: 'desc' },
    });
  },

  async buscarPorId(id) {
    return await prisma.chamado.findUnique({
      where: { id: Number(id) },
      include: { Sistema: true },
    });
  },

  async atualizar(id, data) {
    return await prisma.chamado.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deletar(id) {
    return await prisma.chamado.delete({
      where: { id: Number(id) },
    });
  },
};

module.exports = chamadoService;
