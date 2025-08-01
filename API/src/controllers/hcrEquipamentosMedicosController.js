const service = require('../services/hcrEquipamentosMedicosService');

class HcrEquipamentosMedicosController {
async criar(req, res) {
  try {
    // Remove o campo id se estiver presente no req.body
    if (req.body.id) {
      console.log('🧹 Removendo ID manual:', req.body.id);
      delete req.body.id;
    }

    const arquivos = req.files ? req.files.map(file => file.path) : [];

    const data = {
      ...req.body,
      arquivos
    };

    console.log('📦 Dados enviados para o service:', data);

    const equipamento = await service.criar(data);
    res.status(201).json(equipamento);

  } catch (error) {
    console.error('❌ Erro ao criar equipamento:', error);
    res.status(500).json({ 
      error: 'Erro ao criar equipamento médico.', 
      detalhes: error.message 
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
    console.error('❌ Erro no controller PUT /equipamentos-medicos/:id:', error); // <---
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
