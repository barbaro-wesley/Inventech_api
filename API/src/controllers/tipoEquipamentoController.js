const tipoEquipamentoService = require('../services/tipoEquipamentoService');

const criar = async (req, res) => {
  try {
    const { nome, taxaDepreciacao, grupoId } = req.body;
    const tipo = await tipoEquipamentoService.criar({ nome, taxaDepreciacao, grupoId });
    res.status(201).json(tipo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listar = async (req, res) => {
  const tipos = await tipoEquipamentoService.listarTodos();
  res.json(tipos);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const { nome, taxaDepreciacao, grupoId } = req.body;
    const atualizado = await tipoEquipamentoService.atualizar(parseInt(id, 10), { nome, taxaDepreciacao, grupoId });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  try {
    await tipoEquipamentoService.remover(parseInt(id, 10));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
};
