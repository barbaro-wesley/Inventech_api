// services/productCategoryService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProductCategoryService {
  async create(data) {
    try {
      return await prisma.productCategory.create({
        data,
        include: {
          produtos: true
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Categoria com este nome já existe');
      }
      throw error;
    }
  }

  async findAll() {
    return await prisma.productCategory.findMany({
      include: {
        produtos: true,
        _count: {
          select: { produtos: true }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });
  }

  async findById(id) {
    const category = await prisma.productCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        produtos: true
      }
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return category;
  }

  async update(id, data) {
    try {
      const category = await prisma.productCategory.update({
        where: { id: parseInt(id) },
        data,
        include: {
          produtos: true
        }
      });
      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Categoria não encontrada');
      }
      if (error.code === 'P2002') {
        throw new Error('Categoria com este nome já existe');
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      // Verifica se há produtos vinculados
      const category = await prisma.productCategory.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: { produtos: true }
          }
        }
      });

      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      if (category._count.produtos > 0) {
        throw new Error('Não é possível excluir categoria que possui produtos vinculados');
      }

      return await prisma.productCategory.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Categoria não encontrada');
      }
      throw error;
    }
  }
}

module.exports = new ProductCategoryService();