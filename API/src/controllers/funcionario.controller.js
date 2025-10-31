// funcionarioController.js

const funcionarioService = require('../services/funcionario.service');

// Criar funcionário
const createFuncionario = async (req, res) => {
  try {
    const { nome, cpf, cargo, setorId, email, telefone } = req.body;
    
    // Validações básicas
    if (!nome || !cpf || !email) {
      return res.status(400).json({ 
        error: 'Nome, CPF e email são obrigatórios' 
      });
    }
    
    // Validação de formato de email (básica)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Formato de email inválido' 
      });
    }
    
    // Validação de CPF (formato básico)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) {
      return res.status(400).json({ 
        error: 'Formato de CPF inválido. Use: 000.000.000-00' 
      });
    }
    
    const data = {
      nome: nome.trim(),
      cpf: cpf.trim(),
      cargo: cargo?.trim() || null,
      setorId: setorId ? parseInt(setorId) : null,
      email: email.trim().toLowerCase(),
      telefone: telefone?.trim() || null
    };
    
    const novoFuncionario = await funcionarioService.createFuncionario(data);
    
    res.status(201).json({
      success: true,
      message: 'Funcionário criado com sucesso',
      data: novoFuncionario
    });
    
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    
    // Tratamento de erros específicos do Prisma
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'cpf') {
        return res.status(409).json({ 
          error: 'CPF já cadastrado no sistema' 
        });
      }
      if (field === 'email') {
        return res.status(409).json({ 
          error: 'Email já cadastrado no sistema' 
        });
      }
    }
    
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
};

// Buscar todos os funcionários com filtros
const getAllFuncionarios = async (req, res) => {
  try {
    const { setorId, nome, cargo } = req.query;
    
    const filters = {};
    if (setorId) filters.setorId = setorId;
    if (nome) filters.nome = nome;
    if (cargo) filters.cargo = cargo;
    
    const funcionarios = await funcionarioService.getAllFuncionarios(filters);
    
    res.json({
      success: true,
      data: funcionarios,
      total: funcionarios.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
};

// Buscar funcionário por ID
const getFuncionarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'ID do funcionário deve ser um número válido' 
      });
    }
    
    const funcionario = await funcionarioService.getFuncionarioById(id);
    
    if (!funcionario) {
      return res.status(404).json({ 
        error: 'Funcionário não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: funcionario
    });
    
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
};

// Atualizar funcionário
const updateFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, cargo, setorId, email, telefone } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'ID do funcionário deve ser um número válido' 
      });
    }
    
    // Validação de formato de email (se informado)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }
    }
    
    // Validação de CPF (se informado)
    if (cpf) {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(cpf)) {
        return res.status(400).json({ 
          error: 'Formato de CPF inválido. Use: 000.000.000-00' 
        });
      }
    }
    
    const data = {
      nome: nome?.trim(),
      cpf: cpf?.trim(),
      cargo: cargo?.trim() || null,
      setorId: setorId ? parseInt(setorId) : null,
      email: email?.trim().toLowerCase(),
      telefone: telefone?.trim() || null
    };
    
    // Remove campos undefined/null para não sobrescrever
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });
    
    const funcionarioAtualizado = await funcionarioService.updateFuncionario(id, data);
    
    res.json({
      success: true,
      message: 'Funcionário atualizado com sucesso',
      data: funcionarioAtualizado
    });
    
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'cpf') {
        return res.status(409).json({ 
          error: 'CPF já cadastrado no sistema' 
        });
      }
      if (field === 'email') {
        return res.status(409).json({ 
          error: 'Email já cadastrado no sistema' 
        });
      }
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Funcionário não encontrado' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
};

// Buscar funcionários por setor
const getFuncionariosBySetor = async (req, res) => {
  try {
    const { setorId } = req.params;
    
    if (!setorId || isNaN(parseInt(setorId))) {
      return res.status(400).json({ 
        error: 'ID do setor deve ser um número válido' 
      });
    }
    
    const funcionarios = await funcionarioService.getFuncionariosBySetor(setorId);
    
    res.json({
      success: true,
      data: funcionarios,
      total: funcionarios.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar funcionários por setor:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
};

// Deletar funcionário
const deleteFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'ID do funcionário deve ser um número válido' 
      });
    }
    
    await funcionarioService.deleteFuncionario(id);
    
    res.json({
      success: true,
      message: 'Funcionário deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Funcionário não encontrado' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  createFuncionario,
  getAllFuncionarios,
  getFuncionarioById,
  updateFuncionario,
  getFuncionariosBySetor,
  deleteFuncionario
};