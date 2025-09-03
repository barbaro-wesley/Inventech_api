// services/stockMovementService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StockMovementService {
  async create(data) {
    try {
      // Verifica se o produto existe
      const product = await prisma.product.findUnique({
        where: { id: data.produtoId }
      });

      if (!product) {
        throw new Error('Produto não encontrado');
      }

      // Para saída, verifica se há estoque suficiente
      if (data.tipo === 'SAIDA' && product.quantidade < data.quantidade) {
        throw new Error('Estoque insuficiente para realizar a saída');
      }

      // Usa transaction para garantir consistência
      return await prisma.$transaction(async (tx) => {
        // Cria a movimentação
        const movement = await tx.stockMovement.create({
          data,
          include: {
            produto: {
              include: {
                categoria: true
              }
            },
            usuario: true
          }
        });

        // Atualiza o estoque do produto
        const novaQuantidade = data.tipo === 'ENTRADA' 
          ? product.quantidade + data.quantidade
          : product.quantidade - data.quantidade;

        await tx.product.update({
          where: { id: data.produtoId },
          data: { quantidade: novaQuantidade }
        });

        return movement;
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters = {}) {
    const where = {};
    
    if (filters.produtoId) {
      where.produtoId = parseInt(filters.produtoId);
    }
    
    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters.usuarioId) {
      where.usuarioId = parseInt(filters.usuarioId);
    }

    if (filters.dataInicio && filters.dataFim) {
      where.data = {
        gte: new Date(filters.dataInicio),
        lte: new Date(filters.dataFim)
      };
    }

    return await prisma.stockMovement.findMany({
      where,
      include: {
        produto: {
          include: {
            categoria: true
          }
        },
        usuario: true
      },
      orderBy: {
        data: 'desc'
      }
    });
  }

  async findById(id) {
    const movement = await prisma.stockMovement.findUnique({
      where: { id: parseInt(id) },
      include: {
        produto: {
          include: {
            categoria: true
          }
        },
        usuario: true
      }
    });

    if (!movement) {
      throw new Error('Movimentação não encontrada');
    }

    return movement;
  }

  async findByProduct(produtoId) {
    return await prisma.stockMovement.findMany({
      where: { produtoId: parseInt(produtoId) },
      include: {
        usuario: true
      },
      orderBy: {
        data: 'desc'
      }
    });
  }

  async getMovementsByDateRange(dataInicio, dataFim) {
    return await prisma.stockMovement.findMany({
      where: {
        data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      },
      include: {
        produto: {
          include: {
            categoria: true
          }
        },
        usuario: true
      },
      orderBy: {
        data: 'desc'
      }
    });
  }

  async getMovementReport(filters = {}) {
    const where = {};
    
    if (filters.dataInicio && filters.dataFim) {
      where.data = {
        gte: new Date(filters.dataInicio),
        lte: new Date(filters.dataFim)
      };
    }

    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    return await prisma.stockMovement.groupBy({
      by: ['tipo'],
      where,
      _count: {
        id: true
      },
      _sum: {
        quantidade: true
      }
    });
  }

  // Não permite atualizar ou deletar movimentações para manter histórico
  async delete(id) {
    throw new Error('Movimentações de estoque não podem ser excluídas para manter o histórico');
  }

  async update(id, data) {
    throw new Error('Movimentações de estoque não podem ser alteradas para manter o histórico');
  }
}

module.exports = new StockMovementService();