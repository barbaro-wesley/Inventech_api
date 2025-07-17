const prisma = require('../config/prismaClient');

const criar = async (data) => {
  const [setor, localizacao, tipoEquipamento] = await Promise.all([
    prisma.setor.findUnique({ where: { id: data.setorId } }),
    prisma.localizacao.findUnique({ where: { id: data.localizacaoId } }),
    prisma.tipoEquipamento.findUnique({ where: { id: data.tipoEquipamentoId } }),
  ]);

  if (!setor) throw new Error('Setor não encontrado');
  if (!localizacao) throw new Error('Localização não encontrada');
  if (!tipoEquipamento) throw new Error('Tipo de equipamento não encontrado');

  return prisma.hcrComputer.create({
    data: {
      nPatrimonio: data.nPatrimonio,
      nomePC: data.nomePC,
      ip: data.ip,
      sistemaOperacional: data.sistemaOperacional,
      setor: { connect: { id: data.setorId } },
      localizacao: { connect: { id: data.localizacaoId } },
      tipoEquipamento: { connect: { id: data.tipoEquipamentoId } },
    },
    include: {
      setor: true,
      localizacao: true,
      tipoEquipamento: true,
    }
  });
};

const listar = async () => {
  return prisma.hcrComputer.findMany({
    orderBy: { nomePC: 'asc' },
    include: {
      setor: true,
      localizacao: {
        include: {
          setor: true, 
        }
      },
      tipoEquipamento: true,
    }
  });
};

const atualizar = async (id, data) => {
  return prisma.hcrComputer.update({
    where: { id },
    data: {
      nPatrimonio: data.nPatrimonio,
      nomePC: data.nomePC,
      ip: data.ip,
      sistemaOperacional: data.sistemaOperacional,
      setor: data.setorId ? { connect: { id: data.setorId } } : undefined,
      localizacao: data.localizacaoId ? { connect: { id: data.localizacaoId } } : undefined,
      tipoEquipamento: data.tipoEquipamentoId ? { connect: { id: data.tipoEquipamentoId } } : undefined,
    },
    include: {
      setor: true,
      localizacao: true,
      tipoEquipamento: true,
    }
  });
};
const remover = async (id) => {
  return prisma.hcrComputer.delete({
    where: { id }
  });
}

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
};
