// funcionarioService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Criar funcionário com relacionamento de setor
const createFuncionario = async (data) => {
  const { nome, cpf, cargo, setorId, email, telefone } = data;
  
  // Valida se o setor existe (opcional)
  if (setorId) {
    const setorExists = await prisma.setor.findUnique({
      where: { id: setorId }
    });
    
    if (!setorExists) {
      throw new Error(`Setor com ID ${setorId} não encontrado`);
    }
  }
  
  return prisma.funcionario.create({
    data: { 
      nome, 
      cpf, 
      cargo, 
      setorId: setorId || null, // Se não informado, fica null
      email, 
      telefone 
    },
    include: {
      setor: true // Inclui os dados do setor na resposta
    }
  });
};

// Buscar funcionário por ID (com setor incluído)
const getFuncionarioById = async (id) => {
  return prisma.funcionario.findUnique({
    where: { id: parseInt(id) },
    include: {
      setor: true
    }
  });
};

// Buscar todos os funcionários (com setor incluído)
const getAllFuncionarios = async (filters = {}) => {
  const { setorId, nome, cargo } = filters;
  
  const where = {};
  
  if (setorId) where.setorId = parseInt(setorId);
  if (nome) where.nome = { contains: nome, mode: 'insensitive' };
  if (cargo) where.cargo = { contains: cargo, mode: 'insensitive' };
  
  return prisma.funcionario.findMany({
    where,
    include: {
      setor: true
    },
    orderBy: {
      nome: 'asc'
    }
  });
};

// Atualizar funcionário
const updateFuncionario = async (id, data) => {
  const { nome, cpf, cargo, setorId, email, telefone } = data;
  
  // Valida se o setor existe (se informado)
  if (setorId) {
    const setorExists = await prisma.setor.findUnique({
      where: { id: setorId }
    });
    
    if (!setorExists) {
      throw new Error(`Setor com ID ${setorId} não encontrado`);
    }
  }
  
  return prisma.funcionario.update({
    where: { id: parseInt(id) },
    data: { 
      nome, 
      cpf, 
      cargo, 
      setorId: setorId || null,
      email, 
      telefone 
    },
    include: {
      setor: true
    }
  });
};

// Buscar funcionários por setor
const getFuncionariosBySetor = async (setorId) => {
  return prisma.funcionario.findMany({
    where: { setorId: parseInt(setorId) },
    include: {
      setor: true
    },
    orderBy: {
      nome: 'asc'
    }
  });
};

// Deletar funcionário
const deleteFuncionario = async (id) => {
  return prisma.funcionario.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  createFuncionario,
  getFuncionarioById,
  getAllFuncionarios,
  updateFuncionario,
  getFuncionariosBySetor,
  deleteFuncionario
};