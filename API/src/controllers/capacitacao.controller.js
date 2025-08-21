// src/controllers/capacitacao.controller.js
const capacitacaoService = require('../services/capacitacao.service');

const getAllCapacitacoes = async (req, res) => {
  try {
    const capacitacoes = await capacitacaoService.getAllCapacitacoes();
    res.json(capacitacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCapacitacaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const capacitacao = await capacitacaoService.getCapacitacaoById(id);
    res.json(capacitacao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCapacitacao = async (req, res) => {
  try {
    const data = req.body;
    const capacitacao = await capacitacaoService.createCapacitacao(data);
    res.status(201).json(capacitacao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllCapacitacoes,
  getCapacitacaoById,
  createCapacitacao
};
