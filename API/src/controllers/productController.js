// controllers/productController.js
const productService = require('../services/productService');

class ProductController {
  async create(req, res) {
    try {
      const { nome, descricao, categoriaId, quantidade, quantidadeMin } = req.body;

      // Validações
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome do produto é obrigatório'
        });
      }

      if (!categoriaId) {
        return res.status(400).json({
          success: false,
          message: 'Categoria é obrigatória'
        });
      }

      const productData = {
        nome,
        descricao: descricao || null,
        categoriaId: parseInt(categoriaId),
        quantidade: quantidade || 0,
        quantidadeMin: quantidadeMin || 0
      };

      const product = await productService.create(productData);

      return res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async findAll(req, res) {
    try {
      const { categoriaId, nome, lowStock } = req.query;
      
      const filters = {};
      if (categoriaId) filters.categoriaId = categoriaId;
      if (nome) filters.nome = nome;
      if (lowStock === 'true') filters.lowStock = true;

      const products = await productService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const product = await productService.findById(id);

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, categoriaId, quantidade, quantidadeMin } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const updateData = {};
      if (nome) updateData.nome = nome;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (categoriaId) updateData.categoriaId = parseInt(categoriaId);
      if (quantidade !== undefined) updateData.quantidade = parseInt(quantidade);
      if (quantidadeMin !== undefined) updateData.quantidadeMin = parseInt(quantidadeMin);

      const product = await productService.update(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: product
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await productService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Produto excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Não é possível excluir produto que possui movimentações de estoque') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getLowStock(req, res) {
    try {
      const products = await productService.getLowStockProducts();

      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getStockReport(req, res) {
    try {
      const report = await productService.getStockReport();

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de estoque:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new ProductController();