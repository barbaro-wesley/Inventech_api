const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAllFuncionarios = async () => {
  return prisma.funcionario.findMany({
    orderBy: { nome: 'asc' }
  });
};

const getFuncionarioById = async (id) => {
  return prisma.funcionario.findUnique({
    where: { id: parseInt(id) },
    include: {
      participacoes: {
        include: { capacitacao: true }
      }
    }
  });
};

const createFuncionario = async (data) => {
  const { nome, cpf, cargo, setor, email, telefone } = data;
  return prisma.funcionario.create({
    data: { nome, cpf, cargo, setor, email, telefone }
  });
};

const updateFuncionario = async (id, data) => {
  return prisma.funcionario.update({
    where: { id: parseInt(id) },
    data
  });
};

const deleteFuncionario = async (id) => {
  return prisma.funcionario.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  getAllFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario
};
