const tecnicoService = require('../services/tecnicoService');

const criar = async (req, res) => {
  try {
    if (!req.body.grupoId) {
      return res.status(400).json({ error: 'grupoId é obrigatório' });
    }

    const tecnico = await tecnicoService.criar(req.body);
    res.status(201).json(tecnico);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listar = async (req, res) => {
  const tecnicos = await tecnicoService.listar();
  res.json(tecnicos);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const tecnico = await tecnicoService.atualizar(parseInt(id), req.body);
    res.json(tecnico);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  try {
    await tecnicoService.remover(parseInt(id));
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
