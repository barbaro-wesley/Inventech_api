const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllPrinters() {
  return await prisma.hcrPrinter.findMany({
    include: {
      localizacao: true,
      setor: true,
      tipoEquipamento: true,
    },
  });
}

async function getPrinterById(id) {
  return await prisma.hcrPrinter.findUnique({
    where: { id: Number(id) },
    include: {
      localizacao: true,
      setor: true,
      tipoEquipamento: true,
    },
  });
}

async function createPrinter(data) {
  return await prisma.hcrPrinter.create({ data });
}

async function updatePrinter(id, data) {
  return await prisma.hcrPrinter.update({
    where: { id: Number(id) },
    data,
  });
}

async function deletePrinter(id) {
  return await prisma.hcrPrinter.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  getAllPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
};
