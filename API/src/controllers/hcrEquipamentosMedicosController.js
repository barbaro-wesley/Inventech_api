const service = require('../services/hcrEquipamentosMedicosService');

class HcrEquipamentosMedicosController {
  async criar(req, res) {
    try {
      const arquivos = req.files ? req.files.map(file => `uploads/pdfs/${file.filename}`) : [];

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
  async listarPorTipo(req, res) {
  try {
    const tipoEquipamentoId = parseInt(req.params.tipoEquipamentoId, 10);
    const lista = await service.listarPorTipo(tipoEquipamentoId);
    res.json(lista);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar os equipamentos por tipo.',
      detalhes: error.message
    });
  }
}
async buscarPorNumeroPatrimonio(req, res) {
    try {
      const { numeroPatrimonio } = req.params;

      if (!numeroPatrimonio) {
        return res.status(400).json({ mensagem: 'Número de patrimônio é obrigatório.' });
      }

      const equipamentos = await service.buscarPorNumeroPatrimonio(numeroPatrimonio);

      if (!equipamentos || equipamentos.length === 0) {
        return res.status(404).json({ mensagem: 'Nenhum equipamento encontrado com esse patrimônio.' });
      }

      return res.status(200).json(equipamentos);
    } catch (error) {
      console.error('Erro ao buscar equipamento por patrimônio:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
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
      const arquivos = req.files ? req.files.map(file => `uploads/pdfs/${file.filename}`) : [];

      const data = {
        ...req.body,
        arquivos,
      };

      const result = await service.atualizar(id, data);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao atualizar equipamento',
        detalhes: error.message,
      });
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
