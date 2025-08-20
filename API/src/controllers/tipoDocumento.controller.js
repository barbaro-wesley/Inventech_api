const tipoService = require('../services/tipoDocumento.service');

const getAllTipos = async (req, res) => {
  try {
    const tipos = await tipoService.getAllTipos();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTipoById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await tipoService.getTipoById(id);
    if (!tipo) return res.status(404).json({ error: 'Tipo de documento não encontrado' });
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTipo = async (req, res) => {
  try {
    const data = req.body;
    const novoTipo = await tipoService.createTipo(data);
    res.status(201).json(novoTipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const tipoAtualizado = await tipoService.updateTipo(id, data);
    res.json(tipoAtualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTipo = async (req, res) => {
  try {
    const { id } = req.params;
    await tipoService.deleteTipo(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTipos,
  getTipoById,
  createTipo,
  updateTipo,
  deleteTipo
};
