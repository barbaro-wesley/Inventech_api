const prisma = require('../config/prismaClient');
const normalizarTaxa = (valor) => {
  if (!valor) return null;
  const num = parseFloat(valor);
  if (isNaN(num)) return null;
  return num > 1 ? num / 100 : num; // se > 1 assume que veio em %, divide por 100
};
const criar = async ({ nome, taxaDepreciacao, grupoId }) => {
  const existente = await prisma.tipoEquipamento.findUnique({ where: { nome } });
  if (existente) throw new Error('Tipo já existe');

  return prisma.tipoEquipamento.create({
    data: {
      nome,
      taxaDepreciacao: normalizarTaxa(taxaDepreciacao),
      grupoId: grupoId ? parseInt(grupoId, 10) : null,
    },
  });
};

const listarTodos = async () => {
  return prisma.tipoEquipamento.findMany({
    orderBy: { nome: 'asc' },
    include: { grupo: true },
  });
};

const atualizar = async (id, { nome, taxaDepreciacao, grupoId }) => {
  return prisma.tipoEquipamento.update({
    where: { id },
    data: {
      nome,
      taxaDepreciacao: normalizarTaxa(taxaDepreciacao),
      grupoId: grupoId ? parseInt(grupoId, 10) : null,
    },
  });
};

const remover = async (id) => {
  const tipo = await prisma.tipoEquipamento.findUnique({ where: { id } });
  if (!tipo) throw new Error('Tipo não encontrado');
  await prisma.tipoEquipamento.delete({ where: { id } });
};

module.exports = {
  criar,
  listarTodos,
  atualizar,
  remover,
};
