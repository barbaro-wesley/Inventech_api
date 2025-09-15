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

const atualizarUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const dados = req.body;

    // Validações básicas
    if (!usuarioId || isNaN(parseInt(usuarioId))) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório e deve ser um número válido'
      });
    }

    // Validar se há dados para atualizar
    if (!dados || Object.keys(dados).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização'
      });
    }

    // Validar email se fornecido
    if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Validar papel se fornecido
    const papeisValidos = ['admin', 'cadastro', 'tecnico', 'visualizador', 'usuario_comum'];
    if (dados.papel && !papeisValidos.includes(dados.papel)) {
      console.log('❌ ERRO: Papel inválido:', dados.papel);
      return res.status(400).json({
        success: false,
        error: `Papel deve ser um dos seguintes: ${papeisValidos.join(', ')}`
      });
    }
    if (dados.papel) console.log('✅ Papel válido:', dados.papel);

    // Validar módulos se fornecidos
    if (dados.modulos !== undefined) {
      if (!Array.isArray(dados.modulos)) {
        return res.status(400).json({
          success: false,
          error: 'Módulos deve ser um array de IDs'
        });
      }
      
      // Validar se todos os IDs são números válidos
      const modulosInvalidos = dados.modulos.filter(id => 
        id !== null && (isNaN(parseInt(id)) || parseInt(id) <= 0)
      );
      
      if (modulosInvalidos.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Todos os IDs de módulos devem ser números válidos'
        });
      }
    }

    // Validar nome se fornecido
    if (dados.nome !== undefined && (!dados.nome || dados.nome.trim().length < 2)) {
      console.log('❌ ERRO: Nome inválido:', dados.nome);
      return res.status(400).json({
        success: false,
        error: 'Nome deve ter pelo menos 2 caracteres'
      });
    }
    if (dados.nome) console.log('✅ Nome válido:', dados.nome);
    // Chamar o service para atualizar
    const usuarioAtualizado = await usuarioService.atualizarUsuario(
      parseInt(usuarioId),
      dados
    );

    return res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    // Tratar erros específicos do Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false,
        error: 'Email já está sendo usado por outro usuário' 
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false,
        error: 'Referência inválida (técnico ou módulo não encontrado)' 
      });
    }

    return res.status(500).json({ 
      success: false,
      error: error.message || 'Erro interno do servidor' 
    });
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
  atualizarUsuario
};