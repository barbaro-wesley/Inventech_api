const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const autenticarUsuario = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário completo no banco (com tecnicoId)
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        tecnicoId: true, 
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
const verificarAdmin = (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado (deve vir do middleware de auth)
    if (!req.usuario) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuário não autenticado' 
      });
    }

    // Verificar se o usuário é admin
    if (req.usuario.papel !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
      });
    }

    // Se chegou aqui, é admin - pode continuar
    next();
    
  } catch (error) {
    console.error('Erro no middleware de verificação admin:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

module.exports = autenticarUsuario, verificarAdmin;
