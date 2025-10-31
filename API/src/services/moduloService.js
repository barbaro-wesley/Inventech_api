const prisma = require('../config/prismaClient');

// Criar um módulo
const criarModulo = async (dados) => {
  const { nome } = dados;

  const moduloExistente = await prisma.modulo.findUnique({ where: { nome } });
  if (moduloExistente) throw new Error('Já existe um módulo com esse nome');

  const novoModulo = await prisma.modulo.create({
    data: { nome },
  });

  return novoModulo;
};

// Listar todos os módulos
const listarTodos = async () => {
  return await prisma.modulo.findMany({
    orderBy: { nome: 'asc' },
  });
};

// Buscar módulo por ID
const buscarPorId = async (id) => {
  return await prisma.modulo.findUnique({
    where: { id },
  });
};

// Atualizar módulo
const atualizarModulo = async (id, dados) => {
  return await prisma.modulo.update({
    where: { id },
    data: dados,
  });
};

// Deletar módulo
const deletarModulo = async (id) => {
  return await prisma.modulo.delete({
    where: { id },
  });
};

module.exports = {
  criarModulo,
  listarTodos,
  buscarPorId,
  atualizarModulo,
  deletarModulo,
};
