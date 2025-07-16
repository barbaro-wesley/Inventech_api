const prisma = require('../config/prismaClient');

const criar = async (nome) => {
  const existente = await prisma.tipoEquipamento.findUnique({ where: { nome } });
  if (existente) throw new Error('Tipo já existe');
  return prisma.tipoEquipamento.create({ data: { nome } });
};

const listarTodos = async () => {
  return prisma.tipoEquipamento.findMany({
    orderBy: { nome: 'asc' },
    include: { grupo: true },
  });
};

const atualizar = async (id, nome) => {
  return prisma.tipoEquipamento.update({
    where: { id },
    data: { nome },
  });
};

const remover = async (id) => {
  const tipo = await prisma.tipoEquipamento.findUnique({ where: { id } });
  if (!tipo) throw new Error('Tipo não encontrado');

  // (opcional) você pode verificar se algum equipamento está usando esse tipo

  await prisma.tipoEquipamento.delete({ where: { id } });
};

module.exports = {
  criar,
  listarTodos,
  atualizar,
  remover,
};
