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
// relatorio dos tecnicos
const gerarRelatorioTecnico = async (tecnicoId, filtros) => {
  const whereClause = {
    tecnicoId: parseInt(tecnicoId),
    criadoEm: {
      gte: new Date(filtros.dataInicio),
      lte: new Date(filtros.dataFim)
    }
  };

  if (filtros.status && filtros.status.length > 0) {
    whereClause.status = { in: filtros.status };
  }

  if (filtros.prioridade && filtros.prioridade.length > 0) {
    whereClause.prioridade = { in: filtros.prioridade };
  }

  const ordens = await prisma.ordemServico.findMany({
    where: whereClause,
    select: {
      id: true,
      descricao: true,
      preventiva: true,
      prioridade: true,
      status: true,
      criadoEm: true,
      iniciadaEm: true,
      finalizadoEm: true,
      canceladaEm: true,
      dataAgendada: true,
      valorManutencao: true,
      resolucao: true,
      tipoEquipamento: true,
      tecnico: true,
      solicitante: { select: { nome: true } },
      Setor: true,
      equipamento: {
        select: {
          nomeEquipamento: true,
          marca: true,
          modelo: true,
          numeroSerie: true,
        }
      }
    },
    orderBy: [
      { dataAgendada: 'asc' },
      { criadoEm: 'desc' }
    ]
  });

  const estatisticas = {
    totalOS: ordens.length,
    porStatus: {},
    porPrioridade: {},
    porTipoEquipamento: {},
    periodo: {
      inicio: filtros.dataInicio,
      fim: filtros.dataFim
    }
  };

  ordens.forEach(os => {
    estatisticas.porStatus[os.status] = (estatisticas.porStatus[os.status] || 0) + 1;
    estatisticas.porPrioridade[os.prioridade] = (estatisticas.porPrioridade[os.prioridade] || 0) + 1;
    const tipoEquipamento = os.tipoEquipamento.nome;
    estatisticas.porTipoEquipamento[tipoEquipamento] = (estatisticas.porTipoEquipamento[tipoEquipamento] || 0) + 1;
  });

  const ordensFormatadas = ordens.map(os => ({
    ...os,
    criadoEm: os.criadoEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    iniciadaEm: os.iniciadaEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    finalizadoEm: os.finalizadoEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    canceladaEm: os.canceladaEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    dataAgendada: os.dataAgendada?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null
  }));

  return {
    message: 'Relatório gerado com sucesso',
    estatisticas,
    ordens: ordensFormatadas
  };
};
const gerarRelatorioResumo = async (tecnicoId, filtros) => {
  const whereClause = {
    tecnicoId: parseInt(tecnicoId),
    criadoEm: {
      gte: new Date(filtros.dataInicio),
      lte: new Date(filtros.dataFim)
    }
  };

  if (filtros.status && filtros.status.length > 0) {
    whereClause.status = { in: filtros.status };
  }

  if (filtros.prioridade && filtros.prioridade.length > 0) {
    whereClause.prioridade = { in: filtros.prioridade };
  }

  const porStatus = await prisma.ordemServico.groupBy({
    by: ['status'],
    where: whereClause,
    _count: { id: true }
  });

  const porPrioridade = await prisma.ordemServico.groupBy({
    by: ['prioridade'],
    where: whereClause,
    _count: { id: true }
  });

  const total = await prisma.ordemServico.count({ where: whereClause });

  const statusFormatado = porStatus.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {});

  const prioridadeFormatada = porPrioridade.reduce((acc, item) => {
    acc[item.prioridade] = item._count.id;
    return acc;
  }, {});

  return {
    message: 'Relatório resumo gerado com sucesso',
    periodo: {
      inicio: filtros.dataInicio,
      fim: filtros.dataFim
    },
    total,
    porStatus: statusFormatado,
    porPrioridade: prioridadeFormatada
  };
};
const gerarRelatorioProdutividade = async (tecnicoId, filtros) => {
  const whereClause = {
    tecnicoId: parseInt(tecnicoId),
    criadoEm: {
      gte: new Date(filtros.dataInicio),
      lte: new Date(filtros.dataFim)
    }
  };

  const todasOS = await prisma.ordemServico.count({ where: whereClause });
  const osConcluidas = await prisma.ordemServico.count({ where: { ...whereClause, status: 'CONCLUIDA' } });
  const osAndamento = await prisma.ordemServico.count({ where: { ...whereClause, status: 'EM_ANDAMENTO' } });
  const osAbertas = await prisma.ordemServico.count({ where: { ...whereClause, status: 'ABERTA' } });
  const osCanceladas = await prisma.ordemServico.count({ where: { ...whereClause, status: 'CANCELADA' } });

  const osComTempo = await prisma.ordemServico.findMany({
    where: {
      ...whereClause,
      status: 'CONCLUIDA',
      iniciadaEm: { not: null },
      finalizadoEm: { not: null }
    },
    select: { iniciadaEm: true, finalizadoEm: true }
  });

  let tempoMedioResolucao = 0;
  if (osComTempo.length > 0) {
    const tempoTotal = osComTempo.reduce((acc, os) => {
      const inicio = new Date(os.iniciadaEm);
      const fim = new Date(os.finalizadoEm);
      return acc + (fim - inicio);
    }, 0);
    tempoMedioResolucao = Math.round(tempoTotal / osComTempo.length / (1000 * 60 * 60));
  }

  const percentualConcluidas = todasOS > 0 ? parseFloat(((osConcluidas / todasOS) * 100).toFixed(1)) : 0;
  const percentualAndamento = todasOS > 0 ? parseFloat(((osAndamento / todasOS) * 100).toFixed(1)) : 0;

  return {
    message: 'Relatório de produtividade gerado com sucesso',
    periodo: {
      inicio: filtros.dataInicio,
      fim: filtros.dataFim
    },
    totais: {
      todas: todasOS,
      concluidas: osConcluidas,
      emAndamento: osAndamento,
      abertas: osAbertas,
      canceladas: osCanceladas
    },
    percentuais: {
      concluidas: percentualConcluidas,
      emAndamento: percentualAndamento
    },
    tempoMedioResolucaoHoras: tempoMedioResolucao
  };
};
const listarOSPorPeriodo = async (tecnicoId, filtros) => {
  const whereClause = {
    tecnicoId: parseInt(tecnicoId),
    criadoEm: {
      gte: new Date(filtros.dataInicio),
      lte: new Date(filtros.dataFim)
    }
  };

  if (filtros.status && filtros.status.length > 0) {
    whereClause.status = { in: filtros.status };
  }

  if (filtros.prioridade && filtros.prioridade.length > 0) {
    whereClause.prioridade = { in: filtros.prioridade };
  }

  const ordens = await prisma.ordemServico.findMany({
    where: whereClause,
    select: {
      id: true,
      descricao: true,
      preventiva: true,
      prioridade: true,
      status: true,
      criadoEm: true,
      iniciadaEm: true,
      finalizadoEm: true,
      canceladaEm: true,
      dataAgendada: true,
      valorManutencao: true,
      resolucao: true,
      tipoEquipamento: true,
      tecnico: true,
      solicitante: { select: { nome: true } },
      Setor: true,
      equipamento: {
        select: {
          nomeEquipamento: true,
          marca: true,
          modelo: true,
          numeroSerie: true,
        }
      }
    },
    orderBy: [
      { dataAgendada: 'asc' },
      { criadoEm: 'desc' }
    ]
  });

  return ordens.map(os => ({
    ...os,
    criadoEm: os.criadoEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    iniciadaEm: os.iniciadaEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    finalizadoEm: os.finalizadoEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    canceladaEm: os.canceladaEm?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null,
    dataAgendada: os.dataAgendada?.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || null
  }));
};



module.exports = {
  criar,
  listar,
  atualizar,
  remover,
  listarEquipamentosPorTecnico,
  listarTiposEquipamentoPorTecnico,
  gerarRelatorioTecnico,
  gerarRelatorioResumo,
  gerarRelatorioProdutividade,
  listarOSPorPeriodo
};