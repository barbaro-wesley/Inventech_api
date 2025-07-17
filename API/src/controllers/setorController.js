const setorService = require('../services/setorService');

const setorController = {
  async criar(req, res) {
    try {
      const setor = await setorService.criar(req.body);
      res.status(201).json(setor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async listar(req, res) {
    try {
      const setores = await setorService.listar();
      res.json(setores);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = setorController;
