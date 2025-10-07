// services/tipoEquipamentoService.js
const prisma = require('../config/prismaClient');

const normalizarTaxa = (valor) => {
  if (!valor) return null;
  const num = parseFloat(valor);
  if (isNaN(num)) return null;
  return num > 1 ? num / 100 : num; // se > 1 assume que veio em %, divide por 100
};

const criar = async ({ nome, taxaDepreciacao, gruposIds }) => {
  const existente = await prisma.tipoEquipamento.findUnique({ where: { nome } });
  if (existente) throw new Error('Tipo já existe');

  return prisma.tipoEquipamento.create({
    data: {
      nome,
      taxaDepreciacao: normalizarTaxa(taxaDepreciacao),
      grupos: {
        connect: gruposIds?.map((id) => ({ id: parseInt(id, 10) })) || [],
      },
    },
    include: { grupos: true },
  });
};

const listarTodos = async () => {
  return prisma.tipoEquipamento.findMany({
    orderBy: { nome: 'asc' },
    include: { grupos: true },
  });
};

const atualizar = async (id, { nome, taxaDepreciacao, gruposIds }) => {
  return prisma.tipoEquipamento.update({
    where: { id },
    data: {
      nome,
      taxaDepreciacao: normalizarTaxa(taxaDepreciacao),
      grupos: {
        set: gruposIds?.map((id) => ({ id: parseInt(id, 10) })) || [],
      },
    },
    include: { grupos: true },
  });
};

const remover = async (id) => {
  const tipo = await prisma.tipoEquipamento.findUnique({ where: { id } });
  if (!tipo) throw new Error('Tipo não encontrado');
  await prisma.tipoEquipamento.delete({ where: { id } });
};

// Novas funções para contagem de equipamentos
const obterContagemPorTipo = async () => {
  try {
    // Busca a contagem de equipamentos agrupados por tipo
    const equipmentCounts = await prisma.hcrEquipamentosMedicos.groupBy({
      by: ['tipoEquipamentoId'],
      _count: {
        id: true,
      },
      where: {
        tipoEquipamentoId: {
          not: null, // Filtra apenas equipamentos que têm tipo definido
        },
      },
    });

    // Busca os nomes dos tipos de equipamento
    const tiposEquipamento = await prisma.tipoEquipamento.findMany({
      where: {
        id: {
          in: equipmentCounts.map(item => item.tipoEquipamentoId),
        },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    // Combina os dados para retornar o resultado final
    const result = equipmentCounts.map(count => {
      const tipo = tiposEquipamento.find(t => t.id === count.tipoEquipamentoId);
      return {
        tipoId: count.tipoEquipamentoId,
        tipoNome: tipo?.nome || 'Tipo não encontrado',
        quantidade: count._count.id,
      };
    });

    // Ordena por nome do tipo para facilitar a visualização
    return result.sort((a, b) => a.tipoNome.localeCompare(b.tipoNome));

  } catch (error) {
    console.error('Erro ao buscar contagem de equipamentos por tipo:', error);
    throw new Error('Erro interno do servidor ao buscar dados');
  }
};

const obterContagemDetalhada = async () => {
  try {
    // Versão mais detalhada que inclui informações adicionais do tipo
    const result = await prisma.tipoEquipamento.findMany({
      select: {
        id: true,
        nome: true,
        taxaDepreciacao: true,
        grupos: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            HcrEquipamentosMedicos: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return result.map(tipo => ({
      tipoId: tipo.id,
      tipoNome: tipo.nome,
      quantidade: tipo._count.HcrEquipamentosMedicos,
      taxaDepreciacao: tipo.taxaDepreciacao,
      grupos: tipo.grupos || [], // Agora retorna array de grupos
    }));

  } catch (error) {
    console.error('Erro ao buscar contagem detalhada de equipamentos por tipo:', error);
    throw new Error('Erro interno do servidor ao buscar dados detalhados');
  }
};

const obterResumoGeral = async () => {
  try {
    const [
      totalEquipamentos,
      totalTipos,
      equipamentosSemTipo,
      countByType
    ] = await Promise.all([
      prisma.hcrEquipamentosMedicos.count(),
      prisma.tipoEquipamento.count(),
      prisma.hcrEquipamentosMedicos.count({
        where: { tipoEquipamentoId: null }
      }),
      obterContagemPorTipo()
    ]);

    return {
      totalEquipamentos,
      totalTipos,
      equipamentosSemTipo,
      countByType,
    };

  } catch (error) {
    console.error('Erro ao buscar resumo de equipamentos:', error);
    throw new Error('Erro interno do servidor ao buscar resumo');
  }
};

const obterContagemPorTipoEspecifico = async (tipoId) => {
  try {
    const tipoInfo = await prisma.tipoEquipamento.findUnique({
      where: { id: tipoId },
      select: {
        id: true,
        nome: true,
        taxaDepreciacao: true,
        grupos: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            HcrEquipamentosMedicos: true,
          },
        },
      },
    });

    if (!tipoInfo) {
      throw new Error('Tipo de equipamento não encontrado');
    }

    return {
      tipoId: tipoInfo.id,
      tipoNome: tipoInfo.nome,
      quantidade: tipoInfo._count.HcrEquipamentosMedicos,
      taxaDepreciacao: tipoInfo.taxaDepreciacao,
      grupos: tipoInfo.grupos || [], // Agora retorna array de grupos
    };

  } catch (error) {
    console.error('Erro ao buscar contagem por tipo específico:', error);
    throw error;
  }
};

module.exports = {
  criar,
  listarTodos,
  atualizar,
  remover,
  obterContagemPorTipo,
  obterContagemDetalhada,
  obterResumoGeral,
  obterContagemPorTipoEspecifico,
};