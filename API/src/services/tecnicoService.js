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
  const dataTratada = {
    ...data,
    grupoId: Array.isArray(data.grupoId)
      ? parseInt(data.grupoId[0])
      : parseInt(data.grupoId),
    admissao: data.admissao ? new Date(data.admissao) : null,
  };

  return prisma.tecnico.update({
    where: { id },
    data: dataTratada,
    include: { grupo: true },
  });
};

const remover = async (id) => {
  await prisma.tecnico.delete({ where: { id } });
};

const listarEquipamentosPorTecnico = async (tecnicoId) => {
  const tecnico = await prisma.tecnico.findUnique({
    where: { id: parseInt(tecnicoId) },
    include: {
      grupo: {
        include: {
          tipos: true, // Inclui todos os TipoEquipamento vinculados ao grupo
        },
      },
    },
  });

  if (!tecnico) {
    throw new Error('Técnico não encontrado');
  }

  const tipoEquipamentoIds = tecnico.grupo.tipos.map((tipo) => tipo.id);
  if (tipoEquipamentoIds.length === 0) {
    return {
      message: 'Nenhum tipo de equipamento associado ao grupo do técnico',
      equipamentos: [],
    };
  }

  const equipamentos = await prisma.hcrEquipamentosMedicos.findMany({
    where: {
      tipoEquipamentoId: { in: tipoEquipamentoIds },
    },
    include: {
      tipoEquipamento: true,
      setor: true,
      localizacao: true,
    },
  });

  if (equipamentos.length === 0) {
    return {
      message: 'Nenhum equipamento encontrado para os tipos associados ao grupo',
      equipamentos: [],
    };
  }

  return {
    message: 'Equipamentos encontrados com sucesso',
    equipamentos,
  };
};
const listarTiposEquipamentoPorTecnico = async (tecnicoId) => {
  const tecnico = await prisma.tecnico.findUnique({
    where: { id: parseInt(tecnicoId) },
    include: {
      grupo: {
        include: {
          tipos: {
            include: {
              grupo: true, // Inclui os detalhes do grupo para cada tipo
            },
          },
        },
      },
    },
  });

  if (!tecnico) {
    throw new Error('Técnico não encontrado');
  }

  const tiposEquipamento = tecnico.grupo.tipos;
  if (tiposEquipamento.length === 0) {
    return {
      message: 'Nenhum tipo de equipamento associado ao grupo do técnico',
      tipos: [],
    };
  }

  // Formata a resposta para corresponder ao exemplo fornecido
  const formattedTipos = tiposEquipamento.map((tipo) => ({
    id: tipo.id,
    nome: tipo.nome,
    grupoId: tipo.grupoId,
    taxaDepreciacao: tipo.taxaDepreciacao,
    grupo: {
      id: tipo.grupo.id,
      nome: tipo.grupo.nome,
      descricao: tipo.grupo.descricao,
    },
  }));

  return {
    message: 'Tipos de equipamento encontrados com sucesso',
    tipos: formattedTipos,
  };
};


module.exports = {
  criar,
  listar,
  atualizar,
  remover,
  listarEquipamentosPorTecnico,
  listarTiposEquipamentoPorTecnico,
};