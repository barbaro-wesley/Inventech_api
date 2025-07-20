const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrdemServicoService {
  async criar(data) {
  return await prisma.ordemServico.create({
    data: {
      ...data,
      arquivos: ['uploads/169999_img1.jpg', 'uploads/170000_img2.png'], // ✅ aqui está correto
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
} 

  async listar() {
    return await prisma.ordemServico.findMany({
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: true,
        Setor: true
      },
    });
  }

  async buscarPorId(id) {
    return await prisma.ordemServico.findUnique({
      where: { id },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: true,
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
}

module.exports = new OrdemServicoService();
