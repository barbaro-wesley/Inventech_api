const hcrAirConditioningService = require('../services/hcrAirConditioningService');

const hcrAirConditioningController = {
  async criar(req, res) {
    try {
      const equipamento = await hcrAirConditioningService.criar(req.body);
      res.status(201).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar ar-condicionado', detalhes: error });
    }
  },

  async listar(req, res) {
    try {
      const equipamentos = await hcrAirConditioningService.listar();
      res.status(200).json(equipamentos);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao listar ares-condicionados' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const equipamento = await hcrAirConditioningService.buscarPorId(Number(id));
      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' });
      }
      res.status(200).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao buscar equipamento' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const equipamento = await hcrAirConditioningService.atualizar(Number(id), req.body);
      res.status(200).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar equipamento' });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await hcrAirConditioningService.deletar(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao deletar equipamento' });
    }
  }
};

module.exports = hcrAirConditioningController;