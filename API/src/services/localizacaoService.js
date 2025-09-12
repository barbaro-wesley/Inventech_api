const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const localizacaoService = {
  async criar(data) {
    const setor = await prisma.setor.findUnique({
      where: { id: data.setorId }
    });

    if (!setor) throw new Error('Setor não encontrado');

    const localizacao = await prisma.localizacao.create({
      data: {
        nome: data.nome,
        setorId: data.setorId
      }
    });

    return localizacao;
  },

  async listar() {
    return prisma.localizacao.findMany({
      include: {
        setor: true
      }
    });
  },

  async buscarPorId(id) {
    return prisma.localizacao.findUnique({
      where: { id: parseInt(id) },
      include: {
        setor: true
      }
    });
  },

  async listarPorSetor(setorId) {
    const setor = await prisma.setor.findUnique({
      where: { id: parseInt(setorId) }
    });

    if (!setor) throw new Error('Setor não encontrado');

    return prisma.localizacao.findMany({
      where: { setorId: parseInt(setorId) },
      include: {
        setor: true
      }
    });
  },

  async editar(id, data) {
    const localizacaoExiste = await prisma.localizacao.findUnique({
      where: { id: parseInt(id) }
    });

    if (!localizacaoExiste) {
      throw new Error('Localização não encontrada');
    }

    // Se está alterando o setor, verifica se o novo setor existe
    if (data.setorId && data.setorId !== localizacaoExiste.setorId) {
      const setor = await prisma.setor.findUnique({
        where: { id: data.setorId }
      });

      if (!setor) throw new Error('Setor não encontrado');
    }

    const localizacao = await prisma.localizacao.update({
      where: { id: parseInt(id) },
      data: {
        nome: data.nome,
        setorId: data.setorId
      },
      include: {
        setor: true
      }
    });

    return localizacao;
  },

  async excluir(id) {
    const localizacaoExiste = await prisma.localizacao.findUnique({
      where: { id: parseInt(id) }
    });

    if (!localizacaoExiste) {
      throw new Error('Localização não encontrada');
    }

    // Verifica se existem equipamentos associados (assumindo que existe essa relação)
    // Descomente se houver a tabela equipamentos relacionada
    /*
    const equipamentosAssociados = await prisma.equipamento.count({
      where: { localizacaoId: parseInt(id) }
    });

    if (equipamentosAssociados > 0) {
      throw new Error('Não é possível excluir a localização pois existem equipamentos associados a ela');
    }
    */

    await prisma.localizacao.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Localização excluída com sucesso' };
  }
};


module.exports = localizacaoService;
