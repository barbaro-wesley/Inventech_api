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
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: { select: { nomeEquipamento: true, numeroSerie: true } }, // 👈 aqui
      },
    });

    if (novaOS.tecnico && novaOS.tecnico.telegramChatId) {
      let msg = `📄 <b>Nova OS Atribuída</b>\n\n`;
      msg += `🔧 Técnico: ${novaOS.tecnico.nome}\n`;
      msg += `📌 Descrição: ${novaOS.descricao}\n`;
      msg += `📍 Setor: ${novaOS.Setor?.nome || 'Não informado'}\n`;
      msg += `🙋 Solicitante: ${novaOS.solicitante?.nome || 'Não informado'}\n`;

      if (novaOS.equipamento) {
        msg += `🖥️ Equipamento: ${novaOS.equipamento.nomeEquipamento || 'N/I'}\n`;
        msg += `🔢 SN: ${novaOS.equipamento.numeroSerie || 'N/I'}\n`;
      }

      if (novaOS.dataAgendada) {
        const dataFormatada = new Date(novaOS.dataAgendada).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        msg += `📅 Data Agendada: ${dataFormatada}\n`;
      }

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
          solicitante: { select: { nome: true } },
          equipamento: { select: { nomeEquipamento: true, numeroSerie: true } },
        },
      }),
      prisma.ordemServico.findMany({
        where: { preventiva: false },
        include: {
          tipoEquipamento: true,
          tecnico: true,
          Setor: true,
          solicitante: { select: { nome: true } },
          equipamento: { select: { nomeEquipamento: true, numeroSerie: true } },
        },
      }),
    ]);

    const totalManutencao = [...preventivas, ...corretivas].reduce((acc, os) => {
      const valor = os.valorManutencao ? Number(os.valorManutencao) : 0;
      return acc + valor;
    }, 0);

    return { preventivas, corretivas, totalManutencao };
  }

  async buscarPorId(id) {
    return await prisma.ordemServico.findUnique({
      where: { id },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: { select: { nomeEquipamento: true, numeroSerie: true } },
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
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: { select: { nomeEquipamento: true, numeroSerie: true } },
      },
    });
  }

  async listarPorTecnico(tecnicoId) {
    return await prisma.ordemServico.findMany({
      where: { tecnicoId: tecnicoId, status: "ABERTA" },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: { select: { nomeEquipamento: true, numeroSerie: true } },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }
}

module.exports = new OrdemServicoService();
