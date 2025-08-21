const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllTipos = async () => {
  return prisma.tipoDocumento.findMany({
    orderBy: { nome: 'asc' }
  });
};

const getTipoById = async (id) => {
  return prisma.tipoDocumento.findUnique({
    where: { id: parseInt(id) }
  });
};

const createTipo = async (data) => {
  const { nome, descricao } = data;

  if (!nome) {
    throw new Error('O campo nome é obrigatório');
  }

  return prisma.tipoDocumento.create({
    data: { nome, descricao }
  });
};

const updateTipo = async (id, data) => {
  return prisma.tipoDocumento.update({
    where: { id: parseInt(id) },
    data
  });
};

const deleteTipo = async (id) => {
  return prisma.tipoDocumento.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  getAllTipos,
  getTipoById,
  createTipo,
  updateTipo,
  deleteTipo
};
