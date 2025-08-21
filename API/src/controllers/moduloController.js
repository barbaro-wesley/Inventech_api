const moduloService = require('../services/moduloService');

// Criar
const criarModulo = async (req, res) => {
  try {
    const modulo = await moduloService.criarModulo(req.body);
    res.status(201).json(modulo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todos
const listarModulos = async (req, res) => {
  try {
    const modulos = await moduloService.listarTodos();
    res.json(modulos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar por ID
const buscarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const modulo = await moduloService.buscarPorId(parseInt(id));
    if (!modulo) return res.status(404).json({ error: 'Módulo não encontrado' });
    res.json(modulo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar
const atualizarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const modulo = await moduloService.atualizarModulo(parseInt(id), req.body);
    res.json(modulo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar
const deletarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    await moduloService.deletarModulo(parseInt(id));
    res.json({ mensagem: 'Módulo deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  criarModulo,
  listarModulos,
  buscarModulo,
  atualizarModulo,
  deletarModulo,
};
