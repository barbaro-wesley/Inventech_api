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

module.exports = {
  relatorioEquipamentosPorSetor,
  relatorioOsPorTecnico
};
