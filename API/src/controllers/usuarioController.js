const usuarioService = require('../services/usuarioService');

const criarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.criarUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const token = await usuarioService.login(req.body);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const perfil = async (req, res) => {
  try {
    const usuario = await usuarioService.buscarPorId(req.usuario.id);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.listarTodos();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

module.exports = {
  criarUsuario,
  login,
  perfil,
  listarUsuarios,
};
