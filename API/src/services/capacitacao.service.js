const prisma = require('../prisma/client');

const getAllCapacitacoes = async () => {
  return prisma.capacitacao.findMany({
    include: {
      tipoDocumento: true,
      participantes: { include: { funcionario: true } }
    },
    orderBy: { data: 'desc' }
  });
};

const getCapacitacaoById = async (id) => {
  return prisma.capacitacao.findUnique({
    where: { id: parseInt(id) },
    include: {
      tipoDocumento: true,
      participantes: { include: { funcionario: true } }
    }
  });
};

const createCapacitacao = async (data) => {
  const { titulo, dataEvento, local, instrutor, tipoDocumentoId, participantesIds = [], arquivoPdf } = data;

  if (!titulo || !dataEvento || !tipoDocumentoId) {
    throw new Error('Campos obrigatórios: titulo, dataEvento e tipoDocumentoId');
  }

  const capacitacao = await prisma.capacitacao.create({
    data: {
      titulo,
      data: new Date(dataEvento),
      local,
      instrutor,
      tipoDocumentoId: parseInt(tipoDocumentoId),
      arquivoPdf,
      participantes: {
        create: participantesIds.map((id) => ({
          funcionarioId: parseInt(id)
        }))
      }
    },
    include: {
      participantes: {
        include: { funcionario: true }
      }
    }
  });

  return capacitacao;
};

module.exports = {
  getAllCapacitacoes,
  getCapacitacaoById,
  createCapacitacao
};
