// controllers/productCategoryController.js
const productCategoryService = require('../services/ProductCategoryService');

class ProductCategoryController {
  async create(req, res) {
    try {
      const { nome } = req.body;

      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome da categoria é obrigatório'
        });
      }

      const category = await productCategoryService.create({ nome });

      return res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: category
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      
      if (error.message === 'Categoria com este nome já existe') {
        return res.status(409).json({
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
      const categories = await productCategoryService.findAll();

      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      
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

      const category = await productCategoryService.findById(id);

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome da categoria é obrigatório'
        });
      }

      const category = await productCategoryService.update(id, { nome });

      return res.status(200).json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: category
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Categoria com este nome já existe') {
        return res.status(409).json({
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

      await productCategoryService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Categoria excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Não é possível excluir categoria que possui produtos vinculados') {
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
}

module.exports = new ProductCategoryController();