const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const relatorioEquipamentosPorSetor = async (setorIds = [], tipoIds = []) => {
  const whereSetor = setorIds.length > 0 ? { id: { in: setorIds } } : {};

  const setores = await prisma.setor.findMany({
    where: whereSetor,
    include: {
      HcrEquipamentosMedicos: {
        where: tipoIds.length > 0 ? { tipoEquipamentoId: { in: tipoIds } } : {},
        include: { tipoEquipamento: true },
      },
    },
  });

  return setores.map((setor) => {
    const equipamentos = setor.HcrEquipamentosMedicos;

    const porTipo = equipamentos.reduce((acc, eq) => {
      const tipo = eq.tipoEquipamento?.nome || "Sem tipo";
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(eq);
      return acc;
    }, {});

    return {
      setor: setor.nome,
      tipos: Object.entries(porTipo).map(([tipo, lista]) => ({
        tipo,
        equipamentos: lista.map((e) => ({
          patrimonio: e.numeroPatrimonio || "-",
          nome: e.nomeEquipamento || e.modelo || "Sem nome",
          serie: e.numeroSerie || "-",
          status: e.status || "-",
        })),
        total: lista.length,
      })),
      totalSetor: equipamentos.length,
    };
  });
};


const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const relatorioOsPorTecnico = async ({ tecnicoIds = [], dataInicio, dataFim, campoData = "criadoEm", statusArray = [] }) => {
  if (tecnicoIds.length === 0 || !dataInicio || !dataFim) return [];

  const enumStatus = ["ABERTA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"];
  const statusFiltros = statusArray.filter(s => enumStatus.includes(s));

  const where = {
    tecnicoId: { in: tecnicoIds },
    [campoData]: { gte: new Date(dataInicio), lte: new Date(dataFim) },
    ...(statusFiltros.length > 0 && { status: { in: statusFiltros } }),
  };

  const ordens = await prisma.ordemServico.findMany({
    where,
    include: {
      tecnico: true,
      equipamento: true,
      tipoEquipamento: true,
    },
    orderBy: { tecnicoId: "asc" },
  });

  const agrupado = ordens.reduce((acc, os) => {
    const tId = os.tecnicoId || 0;
    if (!acc[tId]) {
      acc[tId] = {
        tecnicoId: tId,
        tecnico: os.tecnico ? os.tecnico.nome : "Sem nome",
        quantidade: 0,
        ordens: [],
      };
    }

    acc[tId].ordens.push({
      id: os.id,
      descricao: os.descricao,
      equipamento: os.equipamento?.nomeEquipamento || null,
      status: os.status,
      criadoEm: formatDate(os.criadoEm),        // agora formatado
      finalizadoEm: formatDate(os.finalizadoEm),// agora formatado
      resolucao: os.resolucao,
    });

    acc[tId].quantidade++;
    return acc;
  }, {});

  return Object.values(agrupado);
};

const relatorioPerformanceTecnicos = async ({ 
  dataInicio, 
  dataFim, 
  tecnicoIds = [], 
  incluirDetalhes = false 
}) => {
  if (!dataInicio || !dataFim) return [];

  const where = {
    criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) },
    ...(tecnicoIds.length > 0 && { tecnicoId: { in: tecnicoIds } }),
  };

  const ordens = await prisma.ordemServico.findMany({
    where,
    include: {
      tecnico: true,
      equipamento: { include: { tipoEquipamento: true } },
      tipoEquipamento: true,
    },
  });

  const tecnicos = await prisma.tecnico.findMany({
    where: tecnicoIds.length > 0 ? { id: { in: tecnicoIds } } : {},
    include: { grupo: true },
  });

  const analise = tecnicos.map(tecnico => {
    const ordensDoTecnico = ordens.filter(os => os.tecnicoId === tecnico.id);
    
    const concluidas = ordensDoTecnico.filter(os => os.status === 'CONCLUIDA');
    const abertas = ordensDoTecnico.filter(os => os.status === 'ABERTA');
    const emAndamento = ordensDoTecnico.filter(os => os.status === 'EM_ANDAMENTO');
    const canceladas = ordensDoTecnico.filter(os => os.status === 'CANCELADA');

    // Calcular tempo médio de resolução (apenas para OSs concluídas)
    const temposResolucao = concluidas
      .filter(os => os.criadoEm && os.finalizadoEm)
      .map(os => {
        const inicio = new Date(os.criadoEm);
        const fim = new Date(os.finalizadoEm);
        return (fim - inicio) / (1000 * 60 * 60); // em horas
      });

    const tempoMedioResolucao = temposResolucao.length > 0 
      ? temposResolucao.reduce((a, b) => a + b, 0) / temposResolucao.length 
      : 0;

    // Análise por tipo de equipamento
    const porTipoEquipamento = ordensDoTecnico.reduce((acc, os) => {
      const tipo = os.tipoEquipamento?.nome || 'Sem tipo';
      if (!acc[tipo]) acc[tipo] = { total: 0, concluidas: 0 };
      acc[tipo].total++;
      if (os.status === 'CONCLUIDA') acc[tipo].concluidas++;
      return acc;
    }, {});

    // Calcular taxa de sucesso
    const taxaSucesso = ordensDoTecnico.length > 0 
      ? (concluidas.length / ordensDoTecnico.length) * 100 
      : 0;

    // Valor total das manutenções
    const valorTotal = concluidas
      .filter(os => os.valorManutencao)
      .reduce((sum, os) => sum + parseFloat(os.valorManutencao), 0);

    const resultado = {
      tecnico: {
        id: tecnico.id,
        nome: tecnico.nome,
        email: tecnico.email,
        grupo: tecnico.grupo?.nome || 'Sem grupo',
        ativo: tecnico.ativo,
      },
      estatisticas: {
        totalOrdens: ordensDoTecnico.length,
        concluidas: concluidas.length,
        abertas: abertas.length,
        emAndamento: emAndamento.length,
        canceladas: canceladas.length,
        taxaSucesso: Math.round(taxaSucesso * 100) / 100,
        tempoMedioResolucaoHoras: Math.round(tempoMedioResolucao * 100) / 100,
        valorTotalManutencoes: valorTotal,
      },
      analisePorTipo: Object.entries(porTipoEquipamento).map(([tipo, dados]) => ({
        tipo,
        total: dados.total,
        concluidas: dados.concluidas,
        taxaSucesso: dados.total > 0 ? Math.round((dados.concluidas / dados.total) * 10000) / 100 : 0,
      })),
    };

    if (incluirDetalhes) {
      resultado.ordensDetalhadas = ordensDoTecnico.map(os => ({
        id: os.id,
        descricao: os.descricao,
        equipamento: os.equipamento?.nomeEquipamento || 'N/A',
        tipoEquipamento: os.tipoEquipamento?.nome || 'N/A',
        status: os.status,
        criadoEm: formatDate(os.criadoEm),
        finalizadoEm: formatDate(os.finalizadoEm),
        tempoResolucaoHoras: os.criadoEm && os.finalizadoEm 
          ? Math.round(((new Date(os.finalizadoEm) - new Date(os.criadoEm)) / (1000 * 60 * 60)) * 100) / 100
          : null,
        valorManutencao: os.valorManutencao ? parseFloat(os.valorManutencao) : null,
      }));
    }

    return resultado;
  });

  return analise.sort((a, b) => b.estatisticas.taxaSucesso - a.estatisticas.taxaSucesso);
};

// 2. ANÁLISE DE EQUIPAMENTOS CRÍTICOS
const relatorioEquipamentosCriticos = async ({ 
  setorIds = [], 
  tipoIds = [], 
  minimoOcorrencias = 3,
  diasAnalise = 90 
}) => {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - diasAnalise);

  const whereEquipamentos = {};
  if (setorIds.length > 0) whereEquipamentos.setorId = { in: setorIds };
  if (tipoIds.length > 0) whereEquipamentos.tipoEquipamentoId = { in: tipoIds };

  const equipamentos = await prisma.hcrEquipamentosMedicos.findMany({
    where: whereEquipamentos,
    include: {
      setor: true,
      tipoEquipamento: true,
      localizacao: true,
      ordensServico: {
        where: {
          criadoEm: { gte: dataInicio },
        },
        include: {
          tecnico: true,
        },
        orderBy: { criadoEm: 'desc' },
      },
    },
  });

  const equipamentosCriticos = equipamentos
    .filter(eq => eq.ordensServico.length >= minimoOcorrencias)
    .map(eq => {
      const ordens = eq.ordensServico;
      
      // Calcular frequência de problemas
      const diasComProblemas = new Set(
        ordens.map(os => formatDateOnly(os.criadoEm))
      ).size;
      
      const frequenciaProblemas = diasComProblemas / diasAnalise;

      // Análise dos tipos de problema (baseado na descrição)
      const tiposProblema = ordens.reduce((acc, os) => {
        const desc = os.descricao.toLowerCase();
        let categoria = 'outros';
        
        if (desc.includes('não liga') || desc.includes('não funciona')) categoria = 'falha_energetica';
        else if (desc.includes('erro') || desc.includes('falha')) categoria = 'erro_sistema';
        else if (desc.includes('limpeza') || desc.includes('manutenção')) categoria = 'manutencao_preventiva';
        else if (desc.includes('peça') || desc.includes('componente')) categoria = 'substituicao_pecas';
        
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {});

      // Custo total de manutenção
      const custoTotal = ordens
        .filter(os => os.valorManutencao)
        .reduce((sum, os) => sum + parseFloat(os.valorManutencao), 0);

      // Tempo total parado (soma das durações das OSs)
      const tempoTotalParado = ordens
        .filter(os => os.criadoEm && os.finalizadoEm)
        .reduce((total, os) => {
          const inicio = new Date(os.criadoEm);
          const fim = new Date(os.finalizadoEm);
          return total + ((fim - inicio) / (1000 * 60 * 60)); // em horas
        }, 0);

      return {
        equipamento: {
          id: eq.id,
          patrimonio: eq.numeroPatrimonio || 'S/N',
          nome: eq.nomeEquipamento || eq.modelo || 'Sem nome',
          marca: eq.marca || 'N/A',
          modelo: eq.modelo || 'N/A',
          serie: eq.numeroSerie || 'N/A',
        },
        localizacao: {
          setor: eq.setor?.nome || 'Sem setor',
          local: eq.localizacao?.nome || 'Sem localização',
        },
        tipo: eq.tipoEquipamento?.nome || 'Sem tipo',
        criticidade: {
          totalOcorrencias: ordens.length,
          frequenciaProblemas: Math.round(frequenciaProblemas * 10000) / 100, // %
          custoTotalManutencao: custoTotal,
          tempoTotalParadoHoras: Math.round(tempoTotalParado * 100) / 100,
          diasAnalise: diasAnalise,
        },
        analiseProblemas: Object.entries(tiposProblema).map(([tipo, count]) => ({
          tipoProblema: tipo,
          ocorrencias: count,
          percentual: Math.round((count / ordens.length) * 10000) / 100,
        })),
        ultimasOcorrencias: ordens.slice(0, 5).map(os => ({
          id: os.id,
          descricao: os.descricao,
          status: os.status,
          tecnico: os.tecnico?.nome || 'N/A',
          criadoEm: formatDate(os.criadoEm),
          finalizadoEm: formatDate(os.finalizadoEm),
        })),
      };
    })
    .sort((a, b) => b.criticidade.totalOcorrencias - a.criticidade.totalOcorrencias);

  return equipamentosCriticos;
};

// 3. ANÁLISE DE MANUTENÇÕES PREVENTIVAS VS CORRETIVAS
const relatorioManutencaoPreventiva = async ({ 
  dataInicio, 
  dataFim, 
  setorIds = [], 
  tipoIds = [] 
}) => {
  if (!dataInicio || !dataFim) return null;

  const where = {
    criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) },
    ...(setorIds.length > 0 && { setorId: { in: setorIds } }),
    ...(tipoIds.length > 0 && { tipoEquipamentoId: { in: tipoIds } }),
  };

  const ordens = await prisma.ordemServico.findMany({
    where,
    include: {
      equipamento: {
        include: {
          setor: true,
          tipoEquipamento: true,
        },
      },
      tecnico: true,
    },
  });

  const preventivas = ordens.filter(os => os.preventiva === true);
  const corretivas = ordens.filter(os => os.preventiva === false);

  // Análise geral
  const analiseGeral = {
    totalOrdens: ordens.length,
    preventivas: {
      quantidade: preventivas.length,
      percentual: ordens.length > 0 ? Math.round((preventivas.length / ordens.length) * 10000) / 100 : 0,
      custoTotal: preventivas
        .filter(os => os.valorManutencao)
        .reduce((sum, os) => sum + parseFloat(os.valorManutencao), 0),
      tempoMedioResolucao: calcularTempoMedio(preventivas),
    },
    corretivas: {
      quantidade: corretivas.length,
      percentual: ordens.length > 0 ? Math.round((corretivas.length / ordens.length) * 10000) / 100 : 0,
      custoTotal: corretivas
        .filter(os => os.valorManutencao)
        .reduce((sum, os) => sum + parseFloat(os.valorManutencao), 0),
      tempoMedioResolucao: calcularTempoMedio(corretivas),
    },
  };

  // Análise por setor
  const porSetor = {};
  ordens.forEach(os => {
    const setor = os.equipamento?.setor?.nome || 'Sem setor';
    if (!porSetor[setor]) {
      porSetor[setor] = { preventivas: 0, corretivas: 0, total: 0 };
    }
    porSetor[setor].total++;
    if (os.preventiva) {
      porSetor[setor].preventivas++;
    } else {
      porSetor[setor].corretivas++;
    }
  });

  // Análise por tipo de equipamento
  const porTipo = {};
  ordens.forEach(os => {
    const tipo = os.equipamento?.tipoEquipamento?.nome || 'Sem tipo';
    if (!porTipo[tipo]) {
      porTipo[tipo] = { preventivas: 0, corretivas: 0, total: 0 };
    }
    porTipo[tipo].total++;
    if (os.preventiva) {
      porTipo[tipo].preventivas++;
    } else {
      porTipo[tipo].corretivas++;
    }
  });

  return {
    periodo: {
      inicio: formatDateOnly(dataInicio),
      fim: formatDateOnly(dataFim),
    },
    analiseGeral,
    analisePorSetor: Object.entries(porSetor).map(([setor, dados]) => ({
      setor,
      ...dados,
      percentualPreventiva: dados.total > 0 ? Math.round((dados.preventivas / dados.total) * 10000) / 100 : 0,
    })),
    analisePorTipo: Object.entries(porTipo).map(([tipo, dados]) => ({
      tipo,
      ...dados,
      percentualPreventiva: dados.total > 0 ? Math.round((dados.preventivas / dados.total) * 10000) / 100 : 0,
    })),
  };
};

// 4. ANÁLISE DE TENDÊNCIAS TEMPORAIS
const relatorioTendenciasTemporais = async ({ 
  dataInicio, 
  dataFim, 
  agrupamento = 'mes' // 'dia', 'semana', 'mes'
}) => {
  if (!dataInicio || !dataFim) return [];

  const ordens = await prisma.ordemServico.findMany({
    where: {
      criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) },
    },
    include: {
      equipamento: {
        include: { tipoEquipamento: true },
      },
      tecnico: true,
    },
    orderBy: { criadoEm: 'asc' },
  });

  // Função para agrupar por período
  const agruparPorPeriodo = (data) => {
    const date = new Date(data);
    switch (agrupamento) {
      case 'dia':
        return date.toISOString().split('T')[0];
      case 'semana':
        const inicioSemana = new Date(date);
        inicioSemana.setDate(date.getDate() - date.getDay());
        return inicioSemana.toISOString().split('T')[0];
      case 'mes':
      default:
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
  };

  const agrupado = ordens.reduce((acc, os) => {
    const periodo = agruparPorPeriodo(os.criadoEm);
    
    if (!acc[periodo]) {
      acc[periodo] = {
        periodo,
        total: 0,
        preventivas: 0,
        corretivas: 0,
        abertas: 0,
        emAndamento: 0,
        concluidas: 0,
        canceladas: 0,
        custoTotal: 0,
        tiposEquipamento: {},
      };
    }

    acc[periodo].total++;
    acc[periodo][os.status.toLowerCase().replace('_', '')]++;
    
    if (os.preventiva) {
      acc[periodo].preventivas++;
    } else {
      acc[periodo].corretivas++;
    }

    if (os.valorManutencao) {
      acc[periodo].custoTotal += parseFloat(os.valorManutencao);
    }

    const tipo = os.equipamento?.tipoEquipamento?.nome || 'Sem tipo';
    acc[periodo].tiposEquipamento[tipo] = (acc[periodo].tiposEquipamento[tipo] || 0) + 1;

    return acc;
  }, {});

  return Object.values(agrupado).map(dados => ({
    ...dados,
    custoTotal: Math.round(dados.custoTotal * 100) / 100,
    tiposEquipamento: Object.entries(dados.tiposEquipamento).map(([tipo, count]) => ({
      tipo,
      quantidade: count,
    })),
  }));
};

// Função auxiliar para calcular tempo médio
const calcularTempoMedio = (ordens) => {
  const tempos = ordens
    .filter(os => os.criadoEm && os.finalizadoEm)
    .map(os => {
      const inicio = new Date(os.criadoEm);
      const fim = new Date(os.finalizadoEm);
      return (fim - inicio) / (1000 * 60 * 60); // em horas
    });

  return tempos.length > 0 
    ? Math.round((tempos.reduce((a, b) => a + b, 0) / tempos.length) * 100) / 100 
    : 0;
};

// 5. ANÁLISE DE GRUPOS DE MANUTENÇÃO
const relatorioGruposManutencao = async ({ dataInicio, dataFim }) => {
  if (!dataInicio || !dataFim) return [];

  const grupos = await prisma.grupoManutencao.findMany({
    include: {
      tecnicos: {
        include: {
          os: {
            where: {
              criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) },
            },
            include: {
              equipamento: true,
              tipoEquipamento: true,
            },
          },
        },
      },
      tipos: true,
    },
  });

  return grupos.map(grupo => {
    const todasOrdens = grupo.tecnicos.flatMap(t => t.os);
    
    const concluidas = todasOrdens.filter(os => os.status === 'CONCLUIDA');
    const custoTotal = concluidas
      .filter(os => os.valorManutencao)
      .reduce((sum, os) => sum + parseFloat(os.valorManutencao), 0);

    return {
      grupo: {
        id: grupo.id,
        nome: grupo.nome,
        descricao: grupo.descricao,
      },
      tecnicos: grupo.tecnicos.map(t => ({
        id: t.id,
        nome: t.nome,
        ativo: t.ativo,
        totalOrdens: t.os.length,
        ordensConclui_: t.os.filter(os => os.status === 'CONCLUIDA').length,
      })),
      estatisticas: {
        totalTecnicos: grupo.tecnicos.length,
        tecnicosAtivos: grupo.tecnicos.filter(t => t.ativo).length,
        totalOrdens: todasOrdens.length,
        ordensConclui_: concluidas.length,
        custoTotal: Math.round(custoTotal * 100) / 100,
        tiposEquipamento: grupo.tipos.map(t => t.nome),
      },
    };
  });
};

module.exports = {
  relatorioEquipamentosPorSetor,
  relatorioOsPorTecnico,
  relatorioPerformanceTecnicos,
  relatorioEquipamentosCriticos,
  relatorioManutencaoPreventiva,
  relatorioTendenciasTemporais,
  relatorioGruposManutencao,
};
