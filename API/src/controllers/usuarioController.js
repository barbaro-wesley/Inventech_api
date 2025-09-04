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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    });

    res.json({ mensagem: 'Login realizado com sucesso', token });
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

// Nova rota para listar apenas usuários que são técnicos
const listarUsuariosTecnicos = async (req, res) => {
  try {
    const usuariosTecnicos = await usuarioService.listarUsuariosTecnicos();
    res.json(usuariosTecnicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários técnicos' });
  }
};

// Nova rota para listar técnicos disponíveis (sem usuário associado)
const listarTecnicosDisponiveis = async (req, res) => {
  try {
    const tecnicosDisponiveis = await usuarioService.listarTecnicosDisponiveis();
    res.json(tecnicosDisponiveis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar técnicos disponíveis' });
  }
};

const vincularModulo = async (req, res) => {
  try {
    const { usuarioId, moduloId } = req.body;
    const usuario = await usuarioService.vincularModulo(usuarioId, moduloId);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removerModulo = async (req, res) => {
  try {
    const { usuarioId, moduloId } = req.body;
    const usuario = await usuarioService.removerModulo(usuarioId, moduloId);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const atualizarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Validações básicas
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const resultado = await usuarioService.atualizarSenha(req.usuario.id, {
      senhaAtual,
      novaSenha
    });

    res.json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller para admin redefinir senha de qualquer usuário
const redefinirSenha = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { novaSenha } = req.body;

    // Validações básicas
    if (!novaSenha) {
      return res.status(400).json({
        error: 'Nova senha é obrigatória'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const resultado = await usuarioService.redefinirSenha(parseInt(usuarioId), {
      novaSenha
    });

    res.json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  criarUsuario,
  login,
  perfil,
  listarUsuarios,
  listarUsuariosTecnicos,
  listarTecnicosDisponiveis,
  vincularModulo,
  removerModulo,
  atualizarSenha,      // Nova função
  redefinirSenha,      // Nova função
};