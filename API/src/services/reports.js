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
        equipamentos: lista.map(
          (e) => e.nomeEquipamento || e.modelo || "Sem nome"
        ),
        total: lista.length,
      })),
      totalSetor: equipamentos.length,
    };
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

  // Agrupa por técnico
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
      finalizadoEm: os.finalizadoEm,
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
