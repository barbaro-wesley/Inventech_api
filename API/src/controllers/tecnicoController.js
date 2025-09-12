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
  try {
    const tecnicos = await tecnicoService.listar();
    res.status(200).json(tecnicos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const tecnico = await tecnicoService.atualizar(parseInt(id), req.body);
    res.status(200).json(tecnico);
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

const listarEquipamentos = async (req, res) => {
  try {
    const tecnicoId = req.usuario?.tecnicoId;
    if (!tecnicoId) {
      return res.status(401).json({ error: 'Usuário não está associado a um técnico' });
    }
    const result = await tecnicoService.listarEquipamentosPorTecnico(tecnicoId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const listarTiposEquipamento = async (req, res) => {
  try {
    const tecnicoId = req.usuario?.tecnicoId;
    if (!tecnicoId) {
      return res.status(401).json({ error: 'Usuário não está associado a um técnico' });
    }
    const result = await tecnicoService.listarTiposEquipamentoPorTecnico(tecnicoId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
  listarEquipamentos,
  listarTiposEquipamento
};