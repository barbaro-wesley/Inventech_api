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

module.exports = autenticarUsuario;
