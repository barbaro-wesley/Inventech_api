// services/productService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProductService {
  async create(data) {
    try {
      const category = await prisma.productCategory.findUnique({
        where: { id: data.categoriaId }
      });

      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      return await prisma.product.create({
        data,
        include: {
          categoria: true,
          movimentacoes: {
            include: {
              usuario: true
            }
          }
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters = {}) {
    const where = {};
    
    if (filters.categoriaId) {
      where.categoriaId = parseInt(filters.categoriaId);
    }
    
    if (filters.nome) {
      where.nome = {
        contains: filters.nome,
        mode: 'insensitive'
      };
    }

    if (filters.lowStock) {
      where.quantidade = {
        lte: prisma.raw('quantidadeMin')
      };
    }

    return await prisma.product.findMany({
      where,
      include: {
        categoria: true,
        _count: {
          select: { movimentacoes: true }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });
  }

  async findById(id) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        movimentacoes: {
          include: {
            usuario: true
          },
          orderBy: {
            data: 'desc'
          }
        }
      }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return product;
  }

  async update(id, data) {
    try {
      // Se está atualizando a categoria, verifica se existe
      if (data.categoriaId) {
        const category = await prisma.productCategory.findUnique({
          where: { id: data.categoriaId }
        });

        if (!category) {
          throw new Error('Categoria não encontrada');
        }
      }

      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data,
        include: {
          categoria: true,
          movimentacoes: {
            include: {
              usuario: true
            }
          }
        }
      });
      return product;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Produto não encontrado');
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      // Verifica se há movimentações vinculadas
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: { movimentacoes: true }
          }
        }
      });

      if (!product) {
        throw new Error('Produto não encontrado');
      }

      if (product._count.movimentacoes > 0) {
        throw new Error('Não é possível excluir produto que possui movimentações de estoque');
      }

      return await prisma.product.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Produto não encontrado');
      }
      throw error;
    }
  }

  async getLowStockProducts() {
    return await prisma.product.findMany({
      where: {
        quantidade: {
          lte: prisma.raw('quantidadeMin')
        }
      },
      include: {
        categoria: true
      },
      orderBy: {
        quantidade: 'asc'
      }
    });
  }

  async getStockReport() {
    return await prisma.product.findMany({
      select: {
        id: true,
        nome: true,
        quantidade: true,
        quantidadeMin: true,
        categoria: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });
  }
}

module.exports = new ProductService();