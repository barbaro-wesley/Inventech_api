const prisma = require('../config/prismaClient');

const criar = async (data) => {
  const dataTratada = {
    ...data,
    grupoId: Array.isArray(data.grupoId)
      ? parseInt(data.grupoId[0])
      : parseInt(data.grupoId),
    admissao: data.admissao ? new Date(data.admissao) : null,
  };

  return prisma.tecnico.create({
    data: dataTratada,
    include: { grupo: true },
  });
};

const listar = async () => {
  return prisma.tecnico.findMany({
    include: { grupo: true },
    orderBy: { nome: 'asc' },
  });
};

const atualizar = async (id, data) => {
  return prisma.tecnico.update({
    where: { id },
    data,
    include: { grupo: true },
  });
};

const remover = async (id) => {
  await prisma.tecnico.delete({ where: { id } });
};

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
};
