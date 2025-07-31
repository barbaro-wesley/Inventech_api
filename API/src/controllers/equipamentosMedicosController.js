const hcrEquipamentosMedicosService = require('../services/hcrEquipamentosMedicosService');

const hcrEquipamentosMedicosController = {
  async criar(req, res) {
    try {
      const equipamento = await hcrEquipamentosMedicosService.criar(req.body);
      res.status(201).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar equipamento médico', detalhes: error.message });
    }
  },

  async listar(req, res) {
    try {
      const equipamentos = await hcrEquipamentosMedicosService.listar();
      res.status(200).json(equipamentos);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao listar equipamentos médicos' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const equipamento = await hcrEquipamentosMedicosService.buscarPorId(Number(id));
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
    const id = parseInt(req.params.id, 10);
    const result = await equipamentosService.atualizar(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro no controller PUT /equipamentos-medicos/:id:', error); // <---
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
},

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await hcrEquipamentosMedicosService.deletar(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao deletar equipamento' });
    }
  }
};

module.exports = hcrEquipamentosMedicosController;
