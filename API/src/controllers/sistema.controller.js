// sistema.controller.js

const { SistemaService } = require('../services/sistema.service');

const sistemaController = {
  async criar(req, res) {
    try {
      const sistema = await SistemaService.criar(req.body);
      res.status(201).json(sistema);
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao criar sistema', detalhes: error.message });
    }
  },

  async listar(req, res) {
    try {
      const sistemas = await SistemaService.listarTodos();
      res.json(sistemas);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar sistemas', detalhes: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const sistema = await SistemaService.buscarPorId(req.params.id);
      if (!sistema) return res.status(404).json({ erro: 'Sistema não encontrado' });
      res.json(sistema);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar sistema', detalhes: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const sistema = await SistemaService.atualizar(req.params.id, req.body);
      res.json(sistema);
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao atualizar sistema', detalhes: error.message });
    }
  },

  async deletar(req, res) {
    try {
      await SistemaService.deletar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao deletar sistema', detalhes: error.message });
    }
  },
};

module.exports = sistemaController;
