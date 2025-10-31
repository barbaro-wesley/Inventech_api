const incidenteService = require('../services/incidenteService');

const incidenteController = {
  async criar(req, res) {
    try {
      const novoIncidente = await incidenteService.criar(req.body);
      res.status(201).json(novoIncidente);
    } catch (erro) {
      res.status(400).json({ erro: 'Erro ao criar incidente', detalhes: erro.message });
    }
  },

  async listar(req, res) {
    try {
      const incidentes = await incidenteService.listar();
      res.status(200).json(incidentes);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao listar incidentes', detalhes: erro.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const incidente = await incidenteService.buscarPorId(req.params.id);
      if (!incidente) {
        return res.status(404).json({ erro: 'Incidente não encontrado' });
      }
      res.status(200).json(incidente);
    } catch (erro) {
      res.status(400).json({ erro: 'Erro ao buscar incidente', detalhes: erro.message });
    }
  },

  async atualizar(req, res) {
    try {
      const incidenteAtualizado = await incidenteService.atualizar(req.params.id, req.body);
      res.status(200).json(incidenteAtualizado);
    } catch (erro) {
      res.status(400).json({ erro: 'Erro ao atualizar incidente', detalhes: erro.message });
    }
  },

  async deletar(req, res) {
    try {
      await incidenteService.deletar(req.params.id);
      res.status(204).send();
    } catch (erro) {
      res.status(400).json({ erro: 'Erro ao deletar incidente', detalhes: erro.message });
    }
  }
};

module.exports = incidenteController;
