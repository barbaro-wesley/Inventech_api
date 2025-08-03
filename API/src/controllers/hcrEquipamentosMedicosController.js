const service = require('../services/hcrEquipamentosMedicosService');

class HcrEquipamentosMedicosController {
async criar(req, res) {
  try {
       const arquivos = req.files ? req.files.map(file => file.path) : [];

    const data = {
      ...req.body,
      arquivos,
    };

    const equipamento = await service.criar(data);
    res.status(201).json(equipamento);

  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar equipamento médico',
      detalhes: error.message,
    });
  }
}

  async listar(req, res) {
    try {
      const lista = await service.listar();
      res.json(lista);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar os equipamentos.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const equipamento = await service.buscarPorId(req.params.id);
      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado.' });
      }
      res.json(equipamento);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar equipamento.' });
    }
  }

async atualizar(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await service.atualizar(id, req.body);;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
}

  async deletar(req, res) {
    try {
      await service.deletar(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar equipamento.' });
    }
  }
}

module.exports = new HcrEquipamentosMedicosController();
