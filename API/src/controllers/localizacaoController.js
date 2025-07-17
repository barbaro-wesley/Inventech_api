const localizacaoService = require('../services/localizacaoService');

const localizacaoController = {
  async criar(req, res) {
    try {
      const localizacao = await localizacaoService.criar(req.body);
      res.status(201).json(localizacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async listar(req, res) {
    try {
      const localizacoes = await localizacaoService.listar();
      res.json(localizacoes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = localizacaoController;
