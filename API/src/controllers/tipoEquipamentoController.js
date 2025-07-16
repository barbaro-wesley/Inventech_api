const tipoEquipamentoService = require('../services/tipoEquipamentoService');

const criar = async (req, res) => {
  try {
    const tipo = await tipoEquipamentoService.criar(req.body.nome);
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
    const atualizado = await tipoEquipamentoService.atualizar(parseInt(id), req.body.nome);
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  try {
    await tipoEquipamentoService.remover(parseInt(id));
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
