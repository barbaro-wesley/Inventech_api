const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const enviarNotificacaoTelegram = require('../utils/telegram');

class OrdemServicoService {
  async criar(data) {
  const novaOS = await prisma.ordemServico.create({
    data: {
      ...data,
      arquivos: ['uploads/169999_img1.jpg', 'uploads/170000_img2.png'], // ou data.arquivos se quiser receber dinamicamente
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
  const msg = `📄 <b>Nova OS Atribuída</b>\n\n🔧 Técnico: ${novaOS.tecnico.nome}\n📌 Descrição: ${novaOS.descricao}` ;
  await enviarNotificacaoTelegram(novaOS.tecnico.telegramChatId, msg);
}

  return novaOS;
}

 async listar() {
  return await prisma.ordemServico.findMany({
    include: {
      tipoEquipamento: true,
      tecnico: true,
      Setor: true,
      solicitante: {
        select: {
          nome: true
        }
      }
    },
  });
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
