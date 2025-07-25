import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SistemaService = {
  async criar(data) {
    return await prisma.sistema.create({ data });
  },

  async listarTodos() {
    return await prisma.sistema.findMany();
  },

  async buscarPorId(id) {
    return await prisma.sistema.findUnique({ where: { id: Number(id) } });
  },

  async atualizar(id, data) {
    return await prisma.sistema.update({
      where: { id: Number(id) },
      data,
    });
  },

  async deletar(id) {
    return await prisma.sistema.delete({
      where: { id: Number(id) },
    });
  },
};
