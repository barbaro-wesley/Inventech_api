// controllers/stockMovementController.js
const stockMovementService = require('../services/stockMovementService');

class StockMovementController {
  async create(req, res) {
    try {
      const { tipo, produtoId, quantidade, motivo, usuarioId } = req.body;

      // Validações
      if (!tipo || !['ENTRADA', 'SAIDA'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de movimentação inválido. Use ENTRADA ou SAIDA'
        });
      }

      if (!produtoId) {
        return res.status(400).json({
          success: false,
          message: 'Produto é obrigatório'
        });
      }

      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade deve ser maior que zero'
        });
      }

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Usuário é obrigatório'
        });
      }

      const movementData = {
        tipo,
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        motivo: motivo || null,
        usuarioId: parseInt(usuarioId)
      };

      const movement = await stockMovementService.create(movementData);

      return res.status(201).json({
        success: true,
        message: 'Movimentação criada com sucesso',
        data: movement
      });
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      
      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Estoque insuficiente para realizar a saída') {
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

  async findAll(req, res) {
    try {
      const { produtoId, tipo, usuarioId, dataInicio, dataFim } = req.query;
      
      const filters = {};
      if (produtoId) filters.produtoId = produtoId;
      if (tipo) filters.tipo = tipo;
      if (usuarioId) filters.usuarioId = usuarioId;
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;

      const movements = await stockMovementService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      
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

      const movement = await stockMovementService.findById(id);

      return res.status(200).json({
        success: true,
        data: movement
      });
    } catch (error) {
      console.error('Erro ao buscar movimentação:', error);
      
      if (error.message === 'Movimentação não encontrada') {
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

  async findByProduct(req, res) {
    try {
      const { produtoId } = req.params;

      if (!produtoId || isNaN(produtoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto inválido'
        });
      }

      const movements = await stockMovementService.findByProduct(produtoId);

      return res.status(200).json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Erro ao buscar movimentações do produto:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getMovementsByDateRange(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          success: false,
          message: 'Data de início e fim são obrigatórias'
        });
      }

      const movements = await stockMovementService.getMovementsByDateRange(dataInicio, dataFim);

      return res.status(200).json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Erro ao buscar movimentações por período:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getMovementReport(req, res) {
    try {
      const { dataInicio, dataFim, tipo } = req.query;
      
      const filters = {};
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;
      if (tipo) filters.tipo = tipo;

      const report = await stockMovementService.getMovementReport(filters);

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de movimentações:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async update(req, res) {
    return res.status(405).json({
      success: false,
      message: 'Movimentações de estoque não podem ser alteradas para manter o histórico'
    });
  }

  async delete(req, res) {
    return res.status(405).json({
      success: false,
      message: 'Movimentações de estoque não podem ser excluídas para manter o histórico'
    });
  }
}

module.exports = new StockMovementController();