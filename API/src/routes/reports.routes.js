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

module.exports = router;