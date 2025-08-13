const hcrMobiliaService = require('../services/hcrMobiliaService');

class HcrMobiliaController {
  async criar(req, res) {
    try {
      const data = {
        ...req.body,
        valorCompra: req.body.valorCompra ? Number(req.body.valorCompra) : null,
        taxaDepreciacao: req.body.taxaDepreciacao ? Number(req.body.taxaDepreciacao) : null,
        dataCompra: req.body.dataCompra ? new Date(req.body.dataCompra) : null
      };

      const novaMobilia = await hcrMobiliaService.criar(data);
      res.status(201).json(novaMobilia);
    } catch (error) {
      console.error('Erro ao criar mobilia:', error);
      res.status(500).json({ error: 'Erro ao criar mobilia' });
    }
  }

  async listar(req, res) {
    try {
      const lista = await hcrMobiliaService.listar();
      res.json(lista);
    } catch (error) {
      console.error('Erro ao listar mobilias:', error);
      res.status(500).json({ error: 'Erro ao listar mobilias' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const mobilia = await hcrMobiliaService.buscarPorId(req.params.id);
      if (!mobilia) {
        return res.status(404).json({ error: 'Mobilia não encontrada' });
      }
      res.json(mobilia);
    } catch (error) {
      console.error('Erro ao buscar mobilia:', error);
      res.status(500).json({ error: 'Erro ao buscar mobilia' });
    }
  }

  async atualizar(req, res) {
    try {
      const data = {
        ...req.body,
        valorCompra: req.body.valorCompra ? Number(req.body.valorCompra) : undefined,
        taxaDepreciacao: req.body.taxaDepreciacao ? Number(req.body.taxaDepreciacao) : undefined,
        dataCompra: req.body.dataCompra ? new Date(req.body.dataCompra) : undefined
      };

      const mobiliaAtualizada = await hcrMobiliaService.atualizar(req.params.id, data);
      res.json(mobiliaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar mobilia:', error);
      res.status(500).json({ error: 'Erro ao atualizar mobilia' });
    }
  }

  async deletar(req, res) {
    try {
      await hcrMobiliaService.deletar(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar mobilia:', error);
      res.status(500).json({ error: 'Erro ao deletar mobilia' });
    }
  }
}

module.exports = new HcrMobiliaController();