// services/gestaoSoftwareService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GestaoSoftwareService {
  async criarGestaoSoftware(dados) {
    try {
      const gestaoSoftware = await prisma.gestaoSoftware.create({
        data: {
          equipamentoId: dados.equipamentoId,
          software: dados.software,
          versao: dados.versao,
          dataInstalacao: new Date(dados.dataInstalacao),
          responsavel: dados.responsavel,
          licencaSerial: dados.licencaSerial,
          statusLicenca: dados.statusLicenca,
          dataExpiracao: new Date(dados.dataExpiracao),
          motivoInstalacao: dados.motivoInstalacao,
          observacoes: dados.observacoes || null
        },
        include: {
          equipamento: true
        }
      });
      return gestaoSoftware;
    } catch (error) {
      throw new Error(`Erro ao criar gestão de software: ${error.message}`);
    }
  }

  async buscarTodos(page = 1, limit = 10, filtros = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (filtros.software) {
        where.software = { contains: filtros.software, mode: 'insensitive' };
      }
      
      if (filtros.statusLicenca) {
        where.statusLicenca = filtros.statusLicenca;
      }
      
      if (filtros.equipamentoId) {
        where.equipamentoId = parseInt(filtros.equipamentoId);
      }

      if (filtros.responsavel) {
        where.responsavel = { contains: filtros.responsavel, mode: 'insensitive' };
      }

      const [gestoesSoftware, total] = await Promise.all([
        prisma.gestaoSoftware.findMany({
          where,
          skip,
          take: limit,
          include: {
            equipamento: true
          },
          orderBy: { criadoEm: 'desc' }
        }),
        prisma.gestaoSoftware.count({ where })
      ]);

      return {
        dados: gestoesSoftware,
        total,
        pagina: page,
        totalPaginas: Math.ceil(total / limit),
        limite: limit
      };
    } catch (error) {
      throw new Error(`Erro ao buscar gestões de software: ${error.message}`);
    }
  }

  async buscarPorId(id) {
    try {
      const gestaoSoftware = await prisma.gestaoSoftware.findUnique({
        where: { id: parseInt(id) },
        include: {
          equipamento: true
        }
      });
      
      if (!gestaoSoftware) {
        throw new Error('Gestão de software não encontrada');
      }
      
      return gestaoSoftware;
    } catch (error) {
      throw new Error(`Erro ao buscar gestão de software: ${error.message}`);
    }
  }

  async buscarPorEquipamento(equipamentoId) {
    try {
      const gestaoSoftware = await prisma.gestaoSoftware.findUnique({
        where: { equipamentoId: parseInt(equipamentoId) },
        include: {
          equipamento: true
        }
      });
      
      return gestaoSoftware;
    } catch (error) {
      throw new Error(`Erro ao buscar gestão de software por equipamento: ${error.message}`);
    }
  }

  async atualizar(id, dados) {
    try {
      const dadosAtualizacao = { ...dados };
      
      if (dados.dataInstalacao) {
        dadosAtualizacao.dataInstalacao = new Date(dados.dataInstalacao);
      }
      
      if (dados.dataExpiracao) {
        dadosAtualizacao.dataExpiracao = new Date(dados.dataExpiracao);
      }

      const gestaoSoftware = await prisma.gestaoSoftware.update({
        where: { id: parseInt(id) },
        data: dadosAtualizacao,
        include: {
          equipamento: true
        }
      });
      
      return gestaoSoftware;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Gestão de software não encontrada');
      }
      throw new Error(`Erro ao atualizar gestão de software: ${error.message}`);
    }
  }

  async deletar(id) {
    try {
      await prisma.gestaoSoftware.delete({
        where: { id: parseInt(id) }
      });
      
      return { mensagem: 'Gestão de software deletada com sucesso' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Gestão de software não encontrada');
      }
      throw new Error(`Erro ao deletar gestão de software: ${error.message}`);
    }
  }

  async buscarLicencasExpirandoEm(dias = 30) {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + dias);

      const licencasExpirando = await prisma.gestaoSoftware.findMany({
        where: {
          dataExpiracao: {
            lte: dataLimite,
            gte: new Date()
          }
        },
        include: {
          equipamento: true
        },
        orderBy: { dataExpiracao: 'asc' }
      });

      return licencasExpirando;
    } catch (error) {
      throw new Error(`Erro ao buscar licenças expirando: ${error.message}`);
    }
  }

  async relatorioPorStatus() {
    try {
      const relatorio = await prisma.gestaoSoftware.groupBy({
        by: ['statusLicenca'],
        _count: {
          statusLicenca: true
        }
      });

      return relatorio;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório por status: ${error.message}`);
    }
  }
}

module.exports = new GestaoSoftwareService();