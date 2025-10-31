const grupoService = require('../services/grupoManutencaoService');

const criar = async (req, res) => {
  try {
    const grupo = await grupoService.criar(req.body);
    res.status(201).json(grupo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listar = async (req, res) => {
  const grupos = await grupoService.listar();
  res.json(grupos);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const grupo = await grupoService.atualizar(parseInt(id), req.body);
    res.json(grupo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deletar = async (req, res) => {
  const { id } = req.params;
  try {
    await grupoService.remover(parseInt(id));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  criar,
  listar,
  atualizar,
  deletar,
};
