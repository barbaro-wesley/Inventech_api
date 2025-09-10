const express = require("express");
const router = express.Router();
const { 
  relatorioEquipamentosPorSetor,
  relatorioOsPorTecnico,
  relatorioPerformanceTecnicos,
  relatorioEquipamentosCriticos,
  relatorioManutencaoPreventiva,
  relatorioTendenciasTemporais,
  relatorioGruposManutencao,
  relatorioManutencoesPreventivas,
  relatorioProximasManutencoes,
  relatorioManutencoesAtrasadas,
  relatorioEficienciaPreventivas,
  relatorioHistoricoRecorrencias,
} = require("../services/reports");

// Função auxiliar para parsear arrays de IDs
const parseIds = (param) => {
  if (!param) return [];
  return param
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));
};

// Função auxiliar para validar datas
const validateDates = (inicio, fim) => {
  if (!inicio || !fim) return false;
  const startDate = new Date(inicio);
  const endDate = new Date(fim);
  return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
};

// RELATÓRIO 1: Equipamentos por Setor (já existente)
router.get("/equipamentos-por-setor", async (req, res) => {
  try {
    let setorIds = [];
    let tipoIds = [];

    if (req.query.setores) {
      setorIds = parseIds(req.query.setores);
    }

    if (req.query.tipos) {
      tipoIds = parseIds(req.query.tipos);
    }

    const dados = await relatorioEquipamentosPorSetor(setorIds, tipoIds);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

// RELATÓRIO 2: OS por Técnico (já existente)
router.get("/os-por-tecnico", async (req, res) => {
  try {
    const { tecnicos, inicio, fim, campoData = "criadoEm", status } = req.query;

    const tecnicoIds = parseIds(tecnicos);
    const statusArray = status ? status.split(",") : [];

    if (tecnicoIds.length === 0 || !validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar técnicos e intervalo de datas válidas" 
      });
    }

    const dados = await relatorioOsPorTecnico({
      tecnicoIds,
      dataInicio: inicio,
      dataFim: fim,
      campoData,
      statusArray,
    });

    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

// RELATÓRIO 3: Performance dos Técnicos
router.get("/performance-tecnicos", async (req, res) => {
  try {
    const { tecnicos, inicio, fim, detalhes } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const tecnicoIds = parseIds(tecnicos);
    const incluirDetalhes = detalhes === 'true' || detalhes === '1';

    const dados = await relatorioPerformanceTecnicos({
      dataInicio: inicio,
      dataFim: fim,
      tecnicoIds,
      incluirDetalhes,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de performance:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de performance" });
  }
});

// RELATÓRIO 4: Equipamentos Críticos
router.get("/equipamentos-criticos", async (req, res) => {
  try {
    const { 
      setores, 
      tipos, 
      minimo = '3', 
      dias = '90' 
    } = req.query;

    const setorIds = parseIds(setores);
    const tipoIds = parseIds(tipos);
    const minimoOcorrencias = parseInt(minimo) || 3;
    const diasAnalise = parseInt(dias) || 90;

    if (minimoOcorrencias < 1 || diasAnalise < 1) {
      return res.status(400).json({ 
        error: "Mínimo de ocorrências e dias de análise devem ser maiores que 0" 
      });
    }

    const dados = await relatorioEquipamentosCriticos({
      setorIds,
      tipoIds,
      minimoOcorrencias,
      diasAnalise,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de equipamentos críticos:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de equipamentos críticos" });
  }
});

// RELATÓRIO 5: Manutenção Preventiva vs Corretiva
router.get("/manutencao-preventiva", async (req, res) => {
  try {
    const { inicio, fim, setores, tipos } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const setorIds = parseIds(setores);
    const tipoIds = parseIds(tipos);

    const dados = await relatorioManutencaoPreventiva({
      dataInicio: inicio,
      dataFim: fim,
      setorIds,
      tipoIds,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de manutenção preventiva:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de manutenção preventiva" });
  }
});

// RELATÓRIO 6: Tendências Temporais
router.get("/tendencias-temporais", async (req, res) => {
  try {
    const { inicio, fim, agrupamento = 'mes' } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const agrupamentosValidos = ['dia', 'semana', 'mes'];
    if (!agrupamentosValidos.includes(agrupamento)) {
      return res.status(400).json({ 
        error: "Agrupamento deve ser: dia, semana ou mes" 
      });
    }

    const dados = await relatorioTendenciasTemporais({
      dataInicio: inicio,
      dataFim: fim,
      agrupamento,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de tendências:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de tendências" });
  }
});

// RELATÓRIO 7: Análise de Grupos de Manutenção
router.get("/grupos-manutencao", async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const dados = await relatorioGruposManutencao({
      dataInicio: inicio,
      dataFim: fim,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de grupos:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de grupos" });
  }
});

// RELATÓRIO EXTRA: Dashboard Resumo (combinação de vários relatórios)
router.get("/dashboard-resumo", async (req, res) => {
  try {
    const { inicio, fim, setores, tipos, tecnicos } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const setorIds = parseIds(setores);
    const tipoIds = parseIds(tipos);
    const tecnicoIds = parseIds(tecnicos);

    // Executar múltiplos relatórios em paralelo
    const [
      performanceTecnicos,
      equipamentosCriticos,
      manutencaoPreventiva,
      tendenciasTemporais,
      gruposManutencao,
    ] = await Promise.allSettled([
      relatorioPerformanceTecnicos({
        dataInicio: inicio,
        dataFim: fim,
        tecnicoIds,
        incluirDetalhes: false,
      }),
      relatorioEquipamentosCriticos({
        setorIds,
        tipoIds,
        minimoOcorrencias: 2,
        diasAnalise: 30,
      }),
      relatorioManutencaoPreventiva({
        dataInicio: inicio,
        dataFim: fim,
        setorIds,
        tipoIds,
      }),
      relatorioTendenciasTemporais({
        dataInicio: inicio,
        dataFim: fim,
        agrupamento: 'mes',
      }),
      relatorioGruposManutencao({
        dataInicio: inicio,
        dataFim: fim,
      }),
    ]);

    // Tratar resultados das promises
    const dashboard = {
      periodo: { inicio, fim },
      resumoTecnicos: performanceTecnicos.status === 'fulfilled' 
        ? performanceTecnicos.value.slice(0, 5) // Top 5 técnicos
        : null,
      equipamentosCriticos: equipamentosCriticos.status === 'fulfilled' 
        ? equipamentosCriticos.value.slice(0, 10) // Top 10 equipamentos críticos
        : null,
      manutencaoPreventiva: manutencaoPreventiva.status === 'fulfilled' 
        ? manutencaoPreventiva.value?.analiseGeral 
        : null,
      tendenciasTemporais: tendenciasTemporais.status === 'fulfilled' 
        ? tendenciasTemporais.value
        : null,
      gruposManutencao: gruposManutencao.status === 'fulfilled' 
        ? gruposManutencao.value
        : null,
      errors: [
        performanceTecnicos,
        equipamentosCriticos,
        manutencaoPreventiva,
        tendenciasTemporais,
        gruposManutencao,
      ]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason?.message || 'Erro desconhecido'),
    };

    res.json(dashboard);
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error);
    res.status(500).json({ error: "Erro ao gerar dashboard" });
  }
});

// ROTA PARA OBTER INFORMAÇÕES DE FILTROS (útil para frontend)
router.get("/filtros-disponiveis", async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const [setores, tipos, tecnicos, grupos] = await Promise.all([
      prisma.setor.findMany({ select: { id: true, nome: true } }),
      prisma.tipoEquipamento.findMany({ select: { id: true, nome: true } }),
      prisma.tecnico.findMany({ 
        select: { id: true, nome: true, ativo: true },
        where: { ativo: true }
      }),
      prisma.grupoManutencao.findMany({ select: { id: true, nome: true } }),
    ]);

    res.json({
      setores,
      tiposEquipamento: tipos,
      tecnicos,
      gruposManutencao: grupos,
      statusOrdens: ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'],
      agrupamentosTemporais: ['dia', 'semana', 'mes'],
    });
  } catch (error) {
    console.error("Erro ao obter filtros:", error);
    res.status(500).json({ error: "Erro ao obter filtros disponíveis" });
  }
});
// RELATÓRIO 8: Manutenções Preventivas Completo
router.get("/manutencoes-preventivas", async (req, res) => {
  try {
    const { 
      inicio, 
      fim, 
      setores, 
      tecnicos, 
      status, 
      prioridades,
      recorrencias,
      detalhes = 'true',
      apenasAtrasadas = 'false',
      apenasProximasVencimento = 'false',
      diasProximoVencimento = '7'
    } = req.query;

    // Validar datas se fornecidas
    if (inicio && fim && !validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const setorIds = parseIds(setores);
    const tecnicoIds = parseIds(tecnicos);
    const statusArray = status ? status.split(",").map(s => s.trim().toUpperCase()) : [];
    const prioridadeArray = prioridades ? prioridades.split(",").map(p => p.trim().toUpperCase()) : [];
    const recorrenciaArray = recorrencias ? recorrencias.split(",").map(r => r.trim().toUpperCase()) : [];
    
    const incluirDetalhes = detalhes === 'true' || detalhes === '1';
    const somenteAtrasadas = apenasAtrasadas === 'true' || apenasAtrasadas === '1';
    const somenteProximas = apenasProximasVencimento === 'true' || apenasProximasVencimento === '1';
    const diasVencimento = parseInt(diasProximoVencimento) || 7;

    if (diasVencimento < 1) {
      return res.status(400).json({ 
        error: "Dias para próximo vencimento deve ser maior que 0" 
      });
    }

    const dados = await relatorioManutencoesPreventivas({
      dataInicio: inicio,
      dataFim: fim,
      setorIds,
      tecnicoIds,
      statusArray,
      prioridadeArray,
      recorrenciaArray,
      incluirDetalhes,
      apenasAtrasadas: somenteAtrasadas,
      apenasProximasVencimento: somenteProximas,
      diasProximoVencimento: diasVencimento,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de manutenções preventivas:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de manutenções preventivas" });
  }
});

// RELATÓRIO 9: Próximas Manutenções
router.get("/proximas-manutencoes", async (req, res) => {
  try {
    const { 
      diasLimite = '7',
      setores,
      tecnicos,
      prioridades
    } = req.query;

    const dias = parseInt(diasLimite);
    if (dias < 1 || dias > 365) {
      return res.status(400).json({ 
        error: "Dias limite deve estar entre 1 e 365" 
      });
    }

    const setorIds = parseIds(setores);
    const tecnicoIds = parseIds(tecnicos);
    const prioridadeArray = prioridades ? prioridades.split(",").map(p => p.trim().toUpperCase()) : [];

    const dados = await relatorioProximasManutencoes({
      diasLimite: dias,
      setorIds,
      tecnicoIds,
      prioridadeArray,
    });

    res.json({
      parametros: {
        diasLimite: dias,
        dataLimite: new Date(Date.now() + (dias * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      total: dados.length,
      proximasManutencoes: dados
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de próximas manutenções:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de próximas manutenções" });
  }
});

// RELATÓRIO 10: Manutenções Atrasadas
router.get("/manutencoes-atrasadas", async (req, res) => {
  try {
    const { 
      setores,
      tecnicos,
      prioridades
    } = req.query;

    const setorIds = parseIds(setores);
    const tecnicoIds = parseIds(tecnicos);
    const prioridadeArray = prioridades ? prioridades.split(",").map(p => p.trim().toUpperCase()) : [];

    const dados = await relatorioManutencoesAtrasadas({
      setorIds,
      tecnicoIds,
      prioridadeArray,
    });

    // Calcular estatísticas de atraso
    const estatisticas = {
      total: dados.length,
      mediadiasAtraso: dados.length > 0 
        ? Math.round(dados.reduce((acc, m) => acc + m.diasAtraso, 0) / dados.length * 100) / 100
        : 0,
      maiorAtraso: dados.length > 0 
        ? Math.max(...dados.map(m => m.diasAtraso))
        : 0,
      porPrioridade: dados.reduce((acc, m) => {
        acc[m.prioridade] = (acc[m.prioridade] || 0) + 1;
        return acc;
      }, {}),
      porSetor: dados.reduce((acc, m) => {
        const setor = m.Setor?.nome || 'Sem setor';
        acc[setor] = (acc[setor] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      estatisticas,
      manutencoesAtrasadas: dados
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de manutenções atrasadas:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de manutenções atrasadas" });
  }
});

// RELATÓRIO 11: Eficiência de Manutenções Preventivas
router.get("/eficiencia-preventivas", async (req, res) => {
  try {
    const { inicio, fim, setores, tecnicos } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const setorIds = parseIds(setores);
    const tecnicoIds = parseIds(tecnicos);

    const dados = await relatorioEficienciaPreventivas({
      dataInicio: inicio,
      dataFim: fim,
      setorIds,
      tecnicoIds,
    });

    if (!dados) {
      return res.status(400).json({ 
        error: "Não foi possível gerar o relatório de eficiência" 
      });
    }

    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório de eficiência:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de eficiência" });
  }
});

// RELATÓRIO 12: Histórico de Recorrências
router.get("/historico-recorrencias", async (req, res) => {
  try {
    const { 
      equipamentos,
      setores,
      mesesHistorico = '12'
    } = req.query;

    const meses = parseInt(mesesHistorico);
    if (meses < 1 || meses > 60) {
      return res.status(400).json({ 
        error: "Meses de histórico deve estar entre 1 e 60" 
      });
    }

    const equipamentoIds = parseIds(equipamentos);
    const setorIds = parseIds(setores);

    const dados = await relatorioHistoricoRecorrencias({
      equipamentoIds,
      setorIds,
      mesesHistorico: meses,
    });

    // Calcular estatísticas gerais
    const estatisticas = {
      totalEquipamentos: dados.length,
      totalManutencoes: dados.reduce((acc, eq) => acc + eq.totalManutencoes, 0),
      mediaManutencoesPorEquipamento: dados.length > 0 
        ? Math.round(dados.reduce((acc, eq) => acc + eq.totalManutencoes, 0) / dados.length * 100) / 100
        : 0,
      porRecorrencia: dados.reduce((acc, eq) => {
        acc[eq.recorrencia] = (acc[eq.recorrencia] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      parametros: {
        mesesHistorico: meses,
        dataInicio: new Date(Date.now() - (meses * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      estatisticas,
      equipamentos: dados
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de histórico de recorrências:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de histórico de recorrências" });
  }
});

// RELATÓRIO DASHBOARD PREVENTIVAS - Visão consolidada das preventivas
router.get("/dashboard-preventivas", async (req, res) => {
  try {
    const { inicio, fim, setores, tecnicos } = req.query;

    if (!validateDates(inicio, fim)) {
      return res.status(400).json({ 
        error: "É necessário informar um intervalo de datas válidas" 
      });
    }

    const setorIds = parseIds(setores);
    const tecnicoIds = parseIds(tecnicos);

    // Executar relatórios em paralelo
    const [
      resumoGeral,
      proximasManutencoes,
      manutencoesAtrasadas,
      eficiencia,
    ] = await Promise.allSettled([
      relatorioManutencoesPreventivas({
        dataInicio: inicio,
        dataFim: fim,
        setorIds,
        tecnicoIds,
        incluirDetalhes: false,
      }),
      relatorioProximasManutencoes({
        diasLimite: 15,
        setorIds,
        tecnicoIds,
      }),
      relatorioManutencoesAtrasadas({
        setorIds,
        tecnicoIds,
      }),
      relatorioEficienciaPreventivas({
        dataInicio: inicio,
        dataFim: fim,
        setorIds,
        tecnicoIds,
      }),
    ]);

    const dashboard = {
      periodo: { inicio, fim },
      resumoGeral: resumoGeral.status === 'fulfilled' ? resumoGeral.value : null,
      proximasManutencoes: {
        total: proximasManutencoes.status === 'fulfilled' ? proximasManutencoes.value.length : 0,
        lista: proximasManutencoes.status === 'fulfilled' ? proximasManutencoes.value.slice(0, 10) : [],
      },
      manutencoesAtrasadas: {
        total: manutencoesAtrasadas.status === 'fulfilled' ? manutencoesAtrasadas.value.length : 0,
        lista: manutencoesAtrasadas.status === 'fulfilled' ? manutencoesAtrasadas.value.slice(0, 10) : [],
      },
      eficiencia: eficiencia.status === 'fulfilled' ? eficiencia.value : null,
      alertas: [],
    };

    // Gerar alertas
    if (dashboard.manutencoesAtrasadas.total > 0) {
      dashboard.alertas.push({
        tipo: 'ATRASADAS',
        quantidade: dashboard.manutencoesAtrasadas.total,
        mensagem: `${dashboard.manutencoesAtrasadas.total} manutenção(ões) preventiva(s) atrasada(s)`,
        urgencia: 'ALTA'
      });
    }

    if (dashboard.proximasManutencoes.total > 0) {
      dashboard.alertas.push({
        tipo: 'PROXIMAS',
        quantidade: dashboard.proximasManutencoes.total,
        mensagem: `${dashboard.proximasManutencoes.total} manutenção(ões) nos próximos 15 dias`,
        urgencia: 'MEDIA'
      });
    }

    // Coletar erros
    const errors = [resumoGeral, proximasManutencoes, manutencoesAtrasadas, eficiencia]
      .filter(result => result.status === 'rejected')
      .map(result => result.reason?.message || 'Erro desconhecido');

    if (errors.length > 0) {
      dashboard.errors = errors;
    }

    res.json(dashboard);
  } catch (error) {
    console.error("Erro ao gerar dashboard preventivas:", error);
    res.status(500).json({ error: "Erro ao gerar dashboard preventivas" });
  }
});

// ROTA PARA FILTROS ESPECÍFICOS DE PREVENTIVAS
router.get("/filtros-preventivas", async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const [setores, tecnicos, equipamentos] = await Promise.all([
      prisma.setor.findMany({ 
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' }
      }),
      prisma.tecnico.findMany({ 
        select: { id: true, nome: true, email: true, ativo: true },
        where: { ativo: true },
        orderBy: { nome: 'asc' }
      }),
      prisma.equipamento.findMany({
        select: { 
          id: true, 
          nomeEquipamento: true, 
          numeroPatrimonio: true,
          setor: { select: { nome: true } }
        },
        orderBy: { nomeEquipamento: 'asc' }
      })
    ]);

    res.json({
      setores,
      tecnicos,
      equipamentos,
      statusPreventivas: ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'],
      prioridades: ['BAIXO', 'MEDIO', 'ALTO', 'URGENTE'],
      recorrencias: [
        { valor: 'NENHUMA', texto: 'Sem recorrência' },
        { valor: 'DIARIA', texto: 'Diária' },
        { valor: 'SEMANAL', texto: 'Semanal' },
        { valor: 'QUINZENAL', texto: 'Quinzenal' },
        { valor: 'MENSAL', texto: 'Mensal' },
        { valor: 'TRIMESTRAL', texto: 'Trimestral' },
        { valor: 'SEMESTRAL', texto: 'Semestral' },
        { valor: 'ANUAL', texto: 'Anual' },
        { valor: 'PERSONALIZADA', texto: 'Personalizada' }
      ],
      diasLimiteOptions: [3, 7, 15, 30, 60, 90],
      mesesHistoricoOptions: [3, 6, 12, 24, 36]
    });
  } catch (error) {
    console.error("Erro ao obter filtros de preventivas:", error);
    res.status(500).json({ error: "Erro ao obter filtros de preventivas" });
  }
});

module.exports = router;