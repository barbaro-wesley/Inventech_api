const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const enviarNotificacaoTelegram = require('../utils/telegram');

class OrdemServicoService {
  async criar(data) {
  const novaOS = await prisma.ordemServico.create({
    data: {
      ...data,
      preventiva: data.preventiva,
      dataAgendada: data.dataAgendada ?? null,
      recorrencia: data.recorrencia ?? 'NENHUMA',
      intervaloDias: data.intervaloDias ?? null,
      arquivos: data.arquivos || [],
    },
    include: {
      tipoEquipamento: true,
      tecnico: true,
      solicitante: {
        select: {
          nome: true
        }
      },
      Setor: true,
    },
  });

  if (novaOS.tecnico && novaOS.tecnico.telegramChatId) {
    const msg = `📄 <b>Nova OS Atribuída</b>\n\n🔧 Técnico: ${novaOS.tecnico.nome}\n📌 Descrição: ${novaOS.descricao}`;
    await enviarNotificacaoTelegram(novaOS.tecnico.telegramChatId, msg);
  }

  return novaOS;
}

async listar() {
  const [preventivas, corretivas] = await Promise.all([
    prisma.ordemServico.findMany({
      where: { preventiva: true },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        Setor: true,
        solicitante: {
          select: { nome: true },
        },
      },
    }),
    prisma.ordemServico.findMany({
      where: { preventiva: false },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        Setor: true,
        solicitante: {
          select: { nome: true },
        },
      },
    }),
  ]);

  const totalManutencao = [...preventivas, ...corretivas].reduce((acc, os) => {
    const valor = os.valorManutencao ? Number(os.valorManutencao) : 0;
    return acc + valor;
  }, 0);

  return {
    preventivas,
    corretivas,
    totalManutencao,
  };
}

  async buscarPorId(id) {
    return await prisma.ordemServico.findUnique({
      where: { id },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: {
        select: {
          nome: true
        }
      },
        Setor: true
      },
    });
  }

  async atualizar(id, data) {
    return await prisma.ordemServico.update({
      where: { id },
      data,
    });
  }

  async deletar(id) {
    return await prisma.ordemServico.delete({
      where: { id },
    });
  }

  async concluir(id, data) {
  return await prisma.ordemServico.update({
    where: { id },
    data,
    include: {
      tipoEquipamento: true,
      tecnico: true,
      solicitante: {
        select: {
          nome: true
        }
      },
      Setor: true
    },
  });
}
async listarPorTecnico(tecnicoId) {
  return await prisma.ordemServico.findMany({
    where: {
      tecnicoId: tecnicoId,
      status: "ABERTA"
    },
    include: {
      tipoEquipamento: true,
      tecnico: true,
      solicitante: {
        select: {
          nome: true
        }
      },
      Setor: true,
    },
    orderBy: {
      criadoEm: 'desc', // opcional
    }
  });
}
}

module.exports = new OrdemServicoService();