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

const relatorioOsPorTecnico = async ({ 
  tecnicoIds = [], 
  dataInicio, 
  dataFim, 
  campoData = "criadoEm", 
  statusArray = [] 
}) => {
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
      solicitante: true,
      equipamento: {
        include: {
          setor: true,
          localizacao: true,
          tipoEquipamento: true,
        },
      },
      tipoEquipamento: true,
      Setor: true,
      acompanhamentos: {
        include: {
          criadoPor: true, // ← CORRIGIDO: era 'usuario', agora é 'criadoPor'
        },
        orderBy: {
          criadoEm: 'asc',
        },
      },
    },
    orderBy: { tecnicoId: "asc" },
  });
  
  const agrupado = ordens.reduce((acc, os) => {
    const tId = os.tecnicoId || 0;
    if (!acc[tId]) {
      acc[tId] = {
        tecnicoId: tId,
        tecnico: os.tecnico ? os.tecnico.nome : "Sem técnico",
        email: os.tecnico?.email || null,
        quantidade: 0,
        ordens: [],
      };
    }
    
    acc[tId].ordens.push({
      id: os.id,
      descricao: os.descricao,
      status: os.status,
      prioridade: os.prioridade,
      preventiva: os.preventiva,
      valorManutencao: os.valorManutencao ? parseFloat(os.valorManutencao) : null,
      
      // Resolução
      resolucao: os.resolucao,
      
      // Equipamento detalhado
      equipamento: {
        nomeEquipamento: os.equipamento?.nomeEquipamento || "N/I",
        tipo: os.equipamento?.tipoEquipamento?.nome || os.tipoEquipamento?.nome || "N/I",
        numeroPatrimonio: os.equipamento?.numeroPatrimonio || "N/I",
        numeroSerie: os.equipamento?.numeroSerie || "N/I",
        modelo: os.equipamento?.modelo || "N/I",
        fabricante: os.equipamento?.fabricante || "N/I",
        numeroAnvisa: os.equipamento?.numeroAnvisa || null,
        identificacao: os.equipamento?.identificacao || null,
      },
      
      // Responsáveis
      responsaveis: {
        solicitante: os.solicitante?.nome || "Não informado",
        solicitanteEmail: os.solicitante?.email || null,
        tecnico: os.tecnico?.nome || "Não atribuído",
        tecnicoEmail: os.tecnico?.email || null,
      },
      
      // Setor
      setor: {
        nome: os.Setor?.nome || os.equipamento?.setor?.nome || "N/I",
        localizacao: os.equipamento?.localizacao?.nome || null,
      },
      
      // Histórico
      historico: {
        criado: formatDate(os.criadoEm),
        iniciado: formatDate(os.iniciadaEm),
        finalizado: formatDate(os.finalizadoEm),
        cancelado: formatDate(os.canceladaEm),
        dataAgendada: formatDate(os.dataAgendada),
      },
      
      // Acompanhamentos - CORRIGIDO
      acompanhamentos: os.acompanhamentos?.map(acomp => ({
        id: acomp.id,
        descricao: acomp.descricao,
        dataHora: formatDate(acomp.criadoEm),
        usuario: acomp.criadoPor?.nome || "Sistema", // ← CORRIGIDO: era acomp.usuario, agora é acomp.criadoPor
      })) || [],
      
      // Arquivos
      arquivos: os.arquivos || [],
      
      // Recorrência
      recorrencia: {
        tipo: os.recorrencia,
        intervaloDias: os.intervaloDias,
      },
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


const formatDateOnly = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Função para calcular dias até a manutenção
const getDiasAteManutencao = (dataAgendada) => {
  if (!dataAgendada) return null;
  
  const hoje = new Date();
  const agendada = new Date(dataAgendada);
  
  hoje.setHours(0, 0, 0, 0);
  agendada.setHours(0, 0, 0, 0);
  
  const diffTime = agendada - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Função para obter texto dos dias
const getTextoDias = (dias) => {
  if (dias === null) return 'Sem data';
  if (dias < 0) return `${Math.abs(dias)} dias atrás`;
  if (dias === 0) return 'Hoje';
  return `${dias} dias`;
};

// Função para verificar se está atrasada
const isAtrasada = (dataAgendada, status) => {
  if (!dataAgendada || status === 'CONCLUIDA' || status === 'CANCELADA') return false;
  const dias = getDiasAteManutencao(dataAgendada);
  return dias < 0;
};

// Função para verificar se está próxima do vencimento
const isProximaVencimento = (dataAgendada, status, diasLimite = 7) => {
  if (!dataAgendada || status === 'CONCLUIDA' || status === 'CANCELADA') return false;
  const dias = getDiasAteManutencao(dataAgendada);
  return dias >= 0 && dias <= diasLimite;
};

// Função para obter texto da recorrência
const getTextoRecorrencia = (recorrencia, intervaloDias = null) => {
  const textos = {
    NENHUMA: 'Sem recorrência',
    SEM_RECORRENCIA: 'Sem recorrência',
    DIARIA: 'Diária',
    SEMANAL: 'Semanal',
    QUINZENAL: 'Quinzenal',
    MENSAL: 'Mensal',
    TRIMESTRAL: 'Trimestral',
    SEMESTRAL: 'Semestral',
    ANUAL: 'Anual',
    PERSONALIZADA: intervaloDias ? `A cada ${intervaloDias} dias` : 'Personalizada'
  };
  return textos[recorrencia] || 'Sem recorrência';
};

// RELATÓRIO PRINCIPAL DE MANUTENÇÕES PREVENTIVAS
const relatorioManutencoesPreventivas = async ({ 
  dataInicio, 
  dataFim, 
  setorIds = [], 
  tecnicoIds = [], 
  statusArray = [], 
  prioridadeArray = [], 
  recorrenciaArray = [],
  incluirDetalhes = true,
  apenasAtrasadas = false,
  apenasProximasVencimento = false,
  diasProximoVencimento = 7
}) => {
  
  const enumStatus = ["ABERTA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"];
  const enumPrioridade = ["BAIXO", "MEDIO", "ALTO", "URGENTE"];
  const enumRecorrencia = ["NENHUMA", "DIARIA", "SEMANAL", "QUINZENAL", "MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL", "PERSONALIZADA"];
  
  const statusFiltros = statusArray.filter(s => enumStatus.includes(s));
  const prioridadeFiltros = prioridadeArray.filter(p => enumPrioridade.includes(p));
  const recorrenciaFiltros = recorrenciaArray.filter(r => enumRecorrencia.includes(r));

  const where = {
    preventiva: true,
    ...(dataInicio && dataFim && {
      dataAgendada: { gte: new Date(dataInicio), lte: new Date(dataFim) }
    }),
    ...(setorIds.length > 0 && { setorId: { in: setorIds } }),
    ...(tecnicoIds.length > 0 && { tecnicoId: { in: tecnicoIds } }),
    ...(statusFiltros.length > 0 && { status: { in: statusFiltros } }),
    ...(prioridadeFiltros.length > 0 && { prioridade: { in: prioridadeFiltros } }),
    ...(recorrenciaFiltros.length > 0 && { recorrencia: { in: recorrenciaFiltros } }),
  };

  const ordensPreventivas = await prisma.ordemServico.findMany({
    where,
    include: {
      tipoEquipamento: true,
      tecnico: { select: { id: true, nome: true, email: true, telefone: true } },
      solicitante: { select: { id: true, nome: true, email: true } },
      Setor: { select: { id: true, nome: true } },
      equipamento: {
        select: {
          id: true,
          nomeEquipamento: true,
          numeroPatrimonio: true,
          numeroSerie: true,
          marca: true,
          modelo: true,
          fabricante: true,
        }
      }
    },
    orderBy: [
      { dataAgendada: 'asc' },
      { prioridade: 'desc' },
      { criadoEm: 'desc' }
    ]
  });

  // Enriquecer dados com informações calculadas
  let dadosEnriquecidos = ordensPreventivas.map(os => ({
    ...os,
    diasAteManutencao: getDiasAteManutencao(os.dataAgendada),
    textoDias: getTextoDias(getDiasAteManutencao(os.dataAgendada)),
    isAtrasada: isAtrasada(os.dataAgendada, os.status),
    isProximaVencimento: isProximaVencimento(os.dataAgendada, os.status, diasProximoVencimento),
    textoRecorrencia: getTextoRecorrencia(os.recorrencia, os.intervaloDias),
    criadoEmFormatado: formatDate(os.criadoEm),
    dataAgendadaFormatada: formatDateOnly(os.dataAgendada),
    finalizadoEmFormatado: formatDate(os.finalizadoEm),
    iniciadaEmFormatado: formatDate(os.iniciadaEm),
    canceladaEmFormatado: formatDate(os.canceladaEm),
  }));

  // Aplicar filtros específicos
  if (apenasAtrasadas) {
    dadosEnriquecidos = dadosEnriquecidos.filter(os => os.isAtrasada);
  }

  if (apenasProximasVencimento) {
    dadosEnriquecidos = dadosEnriquecidos.filter(os => os.isProximaVencimento);
  }

  // Calcular estatísticas
  const total = dadosEnriquecidos.length;
  const abertas = dadosEnriquecidos.filter(os => os.status === 'ABERTA').length;
  const emAndamento = dadosEnriquecidos.filter(os => os.status === 'EM_ANDAMENTO').length;
  const concluidas = dadosEnriquecidos.filter(os => os.status === 'CONCLUIDA').length;
  const canceladas = dadosEnriquecidos.filter(os => os.status === 'CANCELADA').length;
  const atrasadas = dadosEnriquecidos.filter(os => os.isAtrasada).length;
  const proximasVencimento = dadosEnriquecidos.filter(os => os.isProximaVencimento).length;

  // Estatísticas financeiras
  const valorTotal = dadosEnriquecidos.reduce((acc, os) => acc + (parseFloat(os.valorManutencao) || 0), 0);
  const valorExecutado = dadosEnriquecidos
    .filter(os => os.status === 'CONCLUIDA')
    .reduce((acc, os) => acc + (parseFloat(os.valorManutencao) || 0), 0);
  const valorPlanejado = dadosEnriquecidos
    .filter(os => os.status !== 'CONCLUIDA' && os.status !== 'CANCELADA')
    .reduce((acc, os) => acc + (parseFloat(os.valorManutencao) || 0), 0);
  const valorMedio = total > 0 ? valorTotal / total : 0;

  // Análise por prioridade
  const porPrioridade = enumPrioridade.reduce((acc, prioridade) => {
    acc[prioridade] = dadosEnriquecidos.filter(os => os.prioridade === prioridade).length;
    return acc;
  }, {});

  // Análise por recorrência
  const porRecorrencia = dadosEnriquecidos.reduce((acc, os) => {
    const recorrencia = os.recorrencia || 'NENHUMA';
    acc[recorrencia] = (acc[recorrencia] || 0) + 1;
    return acc;
  }, {});

  // Análise por setor
  const porSetor = dadosEnriquecidos.reduce((acc, os) => {
    const setor = os.Setor?.nome || 'Sem setor';
    if (!acc[setor]) acc[setor] = { total: 0, atrasadas: 0, proximas: 0 };
    acc[setor].total++;
    if (os.isAtrasada) acc[setor].atrasadas++;
    if (os.isProximaVencimento) acc[setor].proximas++;
    return acc;
  }, {});

  // Análise por técnico
  const porTecnico = dadosEnriquecidos.reduce((acc, os) => {
    const tecnico = os.tecnico?.nome || 'Não atribuído';
    if (!acc[tecnico]) acc[tecnico] = { 
      total: 0, 
      concluidas: 0, 
      atrasadas: 0, 
      tecnicoId: os.tecnico?.id || null 
    };
    acc[tecnico].total++;
    if (os.status === 'CONCLUIDA') acc[tecnico].concluidas++;
    if (os.isAtrasada) acc[tecnico].atrasadas++;
    return acc;
  }, {});

  const resultado = {
    periodo: dataInicio && dataFim ? {
      inicio: formatDateOnly(dataInicio),
      fim: formatDateOnly(dataFim),
    } : null,
    resumoGeral: {
      total,
      abertas,
      emAndamento,
      concluidas,
      canceladas,
      atrasadas,
      proximasVencimento,
      percentualConclusao: total > 0 ? Math.round((concluidas / total) * 10000) / 100 : 0,
    },
    resumoFinanceiro: {
      valorTotal: Math.round(valorTotal * 100) / 100,
      valorExecutado: Math.round(valorExecutado * 100) / 100,
      valorPlanejado: Math.round(valorPlanejado * 100) / 100,
      valorMedio: Math.round(valorMedio * 100) / 100,
    },
    analisePorPrioridade: Object.entries(porPrioridade).map(([prioridade, quantidade]) => ({
      prioridade,
      quantidade,
      percentual: total > 0 ? Math.round((quantidade / total) * 10000) / 100 : 0,
    })),
    analisePorRecorrencia: Object.entries(porRecorrencia).map(([recorrencia, quantidade]) => ({
      recorrencia,
      textoRecorrencia: getTextoRecorrencia(recorrencia),
      quantidade,
      percentual: total > 0 ? Math.round((quantidade / total) * 10000) / 100 : 0,
    })),
    analisePorSetor: Object.entries(porSetor).map(([setor, dados]) => ({
      setor,
      total: dados.total,
      atrasadas: dados.atrasadas,
      proximasVencimento: dados.proximas,
      percentualAtrasadas: dados.total > 0 ? Math.round((dados.atrasadas / dados.total) * 10000) / 100 : 0,
    })),
    analisePorTecnico: Object.entries(porTecnico).map(([nome, dados]) => ({
      tecnico: nome,
      tecnicoId: dados.tecnicoId,
      total: dados.total,
      concluidas: dados.concluidas,
      atrasadas: dados.atrasadas,
      taxaSucesso: dados.total > 0 ? Math.round((dados.concluidas / dados.total) * 10000) / 100 : 0,
    })),
  };

  // Incluir detalhes se solicitado
  if (incluirDetalhes) {
    resultado.manutencoes = dadosEnriquecidos;
  }

  return resultado;
};

// RELATÓRIO DE PRÓXIMAS MANUTENÇÕES
const relatorioProximasManutencoes = async ({ 
  diasLimite = 7, 
  setorIds = [], 
  tecnicoIds = [],
  prioridadeArray = []
}) => {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + diasLimite);

  const enumPrioridade = ["BAIXO", "MEDIO", "ALTO", "URGENTE"];
  const prioridadeFiltros = prioridadeArray.filter(p => enumPrioridade.includes(p));

  const where = {
    preventiva: true,
    status: { in: ['ABERTA', 'EM_ANDAMENTO'] },
    dataAgendada: {
      gte: new Date(),
      lte: dataLimite
    },
    ...(setorIds.length > 0 && { setorId: { in: setorIds } }),
    ...(tecnicoIds.length > 0 && { tecnicoId: { in: tecnicoIds } }),
    ...(prioridadeFiltros.length > 0 && { prioridade: { in: prioridadeFiltros } }),
  };

  const proximasManutencoes = await prisma.ordemServico.findMany({
    where,
    include: {
      equipamento: {
        select: {
          nomeEquipamento: true,
          numeroPatrimonio: true,
          numeroSerie: true
        }
      },
      Setor: { select: { nome: true } },
      tecnico: { select: { nome: true, email: true } },
      tipoEquipamento: { select: { nome: true } }
    },
    orderBy: [
      { dataAgendada: 'asc' },
      { prioridade: 'desc' }
    ]
  });

  return proximasManutencoes.map(os => ({
    ...os,
    diasAteManutencao: getDiasAteManutencao(os.dataAgendada),
    textoDias: getTextoDias(getDiasAteManutencao(os.dataAgendada)),
    dataAgendadaFormatada: formatDate(os.dataAgendada),
    textoRecorrencia: getTextoRecorrencia(os.recorrencia, os.intervaloDias),
  }));
};

// RELATÓRIO DE MANUTENÇÕES ATRASADAS
const relatorioManutencoesAtrasadas = async ({ 
  setorIds = [], 
  tecnicoIds = [],
  prioridadeArray = []
}) => {
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const enumPrioridade = ["BAIXO", "MEDIO", "ALTO", "URGENTE"];
  const prioridadeFiltros = prioridadeArray.filter(p => enumPrioridade.includes(p));

  const where = {
    preventiva: true,
    status: { in: ['ABERTA', 'EM_ANDAMENTO'] },
    dataAgendada: { lt: hoje },
    ...(setorIds.length > 0 && { setorId: { in: setorIds } }),
    ...(tecnicoIds.length > 0 && { tecnicoId: { in: tecnicoIds } }),
    ...(prioridadeFiltros.length > 0 && { prioridade: { in: prioridadeFiltros } }),
  };

  const manutencoesAtrasadas = await prisma.ordemServico.findMany({
    where,
    include: {
      equipamento: {
        select: {
          nomeEquipamento: true,
          numeroPatrimonio: true,
          numeroSerie: true
        }
      },
      Setor: { select: { nome: true } },
      tecnico: { select: { nome: true, email: true, telefone: true } },
      tipoEquipamento: { select: { nome: true } }
    },
    orderBy: [
      { dataAgendada: 'asc' },
      { prioridade: 'desc' }
    ]
  });

  return manutencoesAtrasadas.map(os => ({
    ...os,
    diasAtraso: Math.abs(getDiasAteManutencao(os.dataAgendada)),
    dataAgendadaFormatada: formatDate(os.dataAgendada),
    criadoEmFormatado: formatDate(os.criadoEm),
    textoRecorrencia: getTextoRecorrencia(os.recorrencia, os.intervaloDias),
  }));
};

// RELATÓRIO DE EFICIÊNCIA DE MANUTENÇÕES PREVENTIVAS
const relatorioEficienciaPreventivas = async ({ 
  dataInicio, 
  dataFim, 
  setorIds = [], 
  tecnicoIds = [] 
}) => {
  if (!dataInicio || !dataFim) return null;

  const where = {
    preventiva: true,
    criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) },
    ...(setorIds.length > 0 && { setorId: { in: setorIds } }),
    ...(tecnicoIds.length > 0 && { tecnicoId: { in: tecnicoIds } }),
  };

  const manutencoes = await prisma.ordemServico.findMany({
    where,
    include: {
      equipamento: {
        include: {
          tipoEquipamento: true,
          setor: true
        }
      },
      tecnico: true
    }
  });

  // Análise de pontualidade
  const pontuais = manutencoes.filter(os => {
    if (!os.dataAgendada || !os.iniciadaEm) return false;
    const agendada = new Date(os.dataAgendada);
    const iniciada = new Date(os.iniciadaEm);
    return iniciada <= agendada;
  });

  const atrasadas = manutencoes.filter(os => {
    if (!os.dataAgendada) return false;
    if (os.status === 'CONCLUIDA' || os.status === 'CANCELADA') return false;
    return getDiasAteManutencao(os.dataAgendada) < 0;
  });

  // Tempo médio de execução
  const comTempoExecucao = manutencoes.filter(os => os.iniciadaEm && os.finalizadoEm);
  const tempoMedioExecucao = comTempoExecucao.length > 0 
    ? comTempoExecucao.reduce((total, os) => {
        const inicio = new Date(os.iniciadaEm);
        const fim = new Date(os.finalizadoEm);
        return total + ((fim - inicio) / (1000 * 60 * 60));
      }, 0) / comTempoExecucao.length
    : 0;

  // Análise por equipamento
  const porEquipamento = {};
  manutencoes.forEach(os => {
    const key = `${os.equipamento?.numeroPatrimonio || 'S/N'} - ${os.equipamento?.nomeEquipamento || 'N/A'}`;
    if (!porEquipamento[key]) {
      porEquipamento[key] = {
        equipamento: key,
        total: 0,
        concluidas: 0,
        atrasadas: 0,
        custoTotal: 0
      };
    }
    porEquipamento[key].total++;
    if (os.status === 'CONCLUIDA') porEquipamento[key].concluidas++;
    if (isAtrasada(os.dataAgendada, os.status)) porEquipamento[key].atrasadas++;
    if (os.valorManutencao) porEquipamento[key].custoTotal += parseFloat(os.valorManutencao);
  });

  return {
    periodo: {
      inicio: formatDateOnly(dataInicio),
      fim: formatDateOnly(dataFim)
    },
    resumoGeral: {
      totalManutencoes: manutencoes.length,
      pontuais: pontuais.length,
      atrasadas: atrasadas.length,
      percentualPontualidade: manutencoes.length > 0 
        ? Math.round((pontuais.length / manutencoes.length) * 10000) / 100 
        : 0,
      tempoMedioExecucaoHoras: Math.round(tempoMedioExecucao * 100) / 100,
      custoTotal: Math.round(manutencoes.reduce((total, os) => 
        total + (parseFloat(os.valorManutencao) || 0), 0) * 100) / 100,
    },
    analisePorEquipamento: Object.values(porEquipamento).map(dados => ({
      ...dados,
      custoTotal: Math.round(dados.custoTotal * 100) / 100,
      eficiencia: dados.total > 0 
        ? Math.round((dados.concluidas / dados.total) * 10000) / 100 
        : 0
    })).sort((a, b) => b.total - a.total)
  };
};

// RELATÓRIO DE HISTÓRICO DE RECORRÊNCIAS
const relatorioHistoricoRecorrencias = async ({ 
  equipamentoIds = [], 
  setorIds = [], 
  mesesHistorico = 12 
}) => {
  const dataInicio = new Date();
  dataInicio.setMonth(dataInicio.getMonth() - mesesHistorico);

  const where = {
    preventiva: true,
    recorrencia: { not: 'NENHUMA' },
    criadoEm: { gte: dataInicio },
    ...(equipamentoIds.length > 0 && { equipamentoId: { in: equipamentoIds } }),
    ...(setorIds.length > 0 && { setorId: { in: setorIds } }),
  };

  const manutencoes = await prisma.ordemServico.findMany({
    where,
    include: {
      equipamento: {
        select: {
          id: true,
          nomeEquipamento: true,
          numeroPatrimonio: true,
          numeroSerie: true
        }
      },
      Setor: { select: { nome: true } },
      tecnico: { select: { nome: true } }
    },
    orderBy: { dataAgendada: 'desc' }
  });

  // Agrupar por equipamento
  const porEquipamento = {};
  manutencoes.forEach(os => {
    const equipamentoId = os.equipamentoId;
    if (!porEquipamento[equipamentoId]) {
      porEquipamento[equipamentoId] = {
        equipamento: os.equipamento,
        setor: os.Setor?.nome,
        recorrencia: os.recorrencia,
        textoRecorrencia: getTextoRecorrencia(os.recorrencia, os.intervaloDias),
        intervaloDias: os.intervaloDias,
        manutencoes: []
      };
    }
    porEquipamento[equipamentoId].manutencoes.push({
      id: os.id,
      dataAgendada: formatDate(os.dataAgendada),
      dataExecucao: formatDate(os.finalizadoEm),
      status: os.status,
      tecnico: os.tecnico?.nome,
      valorManutencao: os.valorManutencao ? parseFloat(os.valorManutencao) : null
    });
  });

  return Object.values(porEquipamento).map(dados => ({
    ...dados,
    totalManutencoes: dados.manutencoes.length,
    ultimaManutencao: dados.manutencoes[0]?.dataAgendada,
    proximaManutencaoEstimada: dados.manutencoes[0]?.dataAgendada 
      ? calcularProximaData(dados.manutencoes[0].dataAgendada, dados.recorrencia, dados.intervaloDias)
      : null
  }));
};

// Função auxiliar para calcular próxima data
const calcularProximaData = (dataBase, recorrencia, intervaloDias = null) => {
  if (!dataBase || !recorrencia || recorrencia === 'NENHUMA') return null;

  const novaData = new Date(dataBase);

  switch (recorrencia) {
    case 'DIARIA':
      novaData.setDate(novaData.getDate() + 1);
      break;
    case 'SEMANAL':
      novaData.setDate(novaData.getDate() + 7);
      break;
    case 'QUINZENAL':
      novaData.setDate(novaData.getDate() + 15);
      break;
    case 'MENSAL':
      novaData.setMonth(novaData.getMonth() + 1);
      break;
    case 'TRIMESTRAL':
      novaData.setMonth(novaData.getMonth() + 3);
      break;
    case 'SEMESTRAL':
      novaData.setMonth(novaData.getMonth() + 6);
      break;
    case 'ANUAL':
      novaData.setFullYear(novaData.getFullYear() + 1);
      break;
    case 'PERSONALIZADA':
      if (intervaloDias && intervaloDias > 0) {
        novaData.setDate(novaData.getDate() + intervaloDias);
      }
      break;
    default:
      return null;
  }

  return formatDate(novaData);
};

module.exports = {
  relatorioEquipamentosPorSetor,
  relatorioOsPorTecnico,
  relatorioPerformanceTecnicos,
  relatorioEquipamentosCriticos,
  relatorioManutencaoPreventiva,
  relatorioTendenciasTemporais,
  relatorioGruposManutencao,
  relatorioHistoricoRecorrencias,
  relatorioManutencoesPreventivas,
  relatorioProximasManutencoes,
  relatorioManutencoesAtrasadas,
  relatorioEficienciaPreventivas,
};
