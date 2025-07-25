const chamadoService = require('../services/chamadoService');

const chamadoController = {
  async criar(req, res) {
    try {
      const chamado = await chamadoService.criar(req.body);
      res.status(201).json(chamado);
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao criar chamado', detalhes: error.message });
    }
  },

  async listar(req, res) {
    try {
      const chamados = await chamadoService.listarTodos();
      res.json(chamados);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar chamados', detalhes: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const chamado = await chamadoService.buscarPorId(req.params.id);
      if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });
      res.json(chamado);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar chamado', detalhes: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const chamado = await chamadoService.atualizar(req.params.id, req.body);
      res.json(chamado);
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao atualizar chamado', detalhes: error.message });
    }
  },

  async deletar(req, res) {
    try {
      await chamadoService.deletar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao deletar chamado', detalhes: error.message });
    }
  },
};

module.exports = chamadoController;
