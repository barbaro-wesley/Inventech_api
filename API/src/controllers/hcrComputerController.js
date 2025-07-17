const service = require('../services/hcrComputerService');

const criar = async (req, res) => {
  try {
    const {
      nPatrimonio,
      nomePC,
      sistemaOperacional,
      setorId,
      localizacaoId,
      tipoEquipamentoId
    } = req.body;

    if (!nPatrimonio || !nomePC || !sistemaOperacional || !setorId || !localizacaoId || !tipoEquipamentoId) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const computador = await service.criar(req.body);
    res.status(201).json(computador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
  const listar = async (req, res) => {
  try {
    const computadores = await service.listar();
    res.json(computadores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const computador = await service.atualizar(parseInt(id), req.body);
    res.json(computador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  try {
    await service.remover(parseInt(id));
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
