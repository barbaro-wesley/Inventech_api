const prisma = require('../config/prismaClient');

const criar = async ({ nome, descricao, tiposIds }) => {
  return prisma.grupoManutencao.create({
    data: {
      nome,
      descricao,
      tipos: {
        connect: tiposIds?.map((id) => ({ id })) || [],
      },
    },
    include: { tipos: true },
  });
};

const listar = async () => {
  return prisma.grupoManutencao.findMany({
    include: { tipos: true },
    orderBy: { nome: 'asc' },
  });
};

const atualizar = async (id, { nome, descricao, tiposIds }) => {
  return prisma.grupoManutencao.update({
    where: { id },
    data: {
      nome,
      descricao,
      tipos: {
        set: tiposIds?.map((id) => ({ id })) || [],
      },
    },
    include: { tipos: true },
  });
};

const remover = async (id) => {
  await prisma.grupoManutencao.delete({ where: { id } });
};

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
};