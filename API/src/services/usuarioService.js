const prisma = require('../config/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const criarUsuario = async (dados) => {
  const { nome, email, senha, papel, tecnicoId } = dados;

  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) throw new Error('E-mail já cadastrado');

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const novoUsuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaCriptografada,
      papel,
      tecnicoId: tecnicoId ? parseInt(tecnicoId) : null, // 🔥 Aqui é o fix
    },
  });

  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  return usuarioSemSenha;
};
const buscarPorId = async (id) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
    },
  });
  return usuario;
};
const login = async ({ email, senha }) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) throw new Error('Usuário não encontrado');

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) throw new Error('Senha inválida');

  const token = jwt.sign(
    { id: usuario.id, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return token;
};
const listarTodos = async () => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });
  return usuarios;
};

module.exports = {
  criarUsuario,
  login,
  buscarPorId,
  listarTodos,
};