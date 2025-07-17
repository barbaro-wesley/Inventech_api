const prisma = require('../config/prismaClient');

const criar = async (data) => {
  return prisma.hcrComputer.create({
    data,
  });
};

const listar = async () => {
  return prisma.hcrComputer.findMany({
    orderBy: { nomePC: 'asc' },
  });
};

const atualizar = async (id, data) => {
  return prisma.hcrComputer.update({
    where: { id },
    data,
  });
};

const remover = async (id) => {
  return prisma.hcrComputer.delete({ where: { id } });
};

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
};
