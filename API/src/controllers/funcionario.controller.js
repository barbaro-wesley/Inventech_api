const funcionarioService = require('../services/funcionario.service.js');

const getAllFuncionarios = async (req, res) => {
  try {
    const funcionarios = await funcionarioService.getAllFuncionarios();
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFuncionarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const funcionario = await funcionarioService.getFuncionarioById(id);
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createFuncionario = async (req, res) => {
  try {
    const data = req.body;
    const novoFuncionario = await funcionarioService.createFuncionario(data);
    res.status(201).json(novoFuncionario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const funcionarioAtualizado = await funcionarioService.updateFuncionario(id, data);
    res.json(funcionarioAtualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    await funcionarioService.deleteFuncionario(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario
};
