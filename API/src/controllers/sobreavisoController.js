const sobreavisoService = require('../services/sobreavisoService');

const sobreavisoController = {
  async criar(req, res) {
  try {
    const colaborador = req.usuario.id ; // Ajuste conforme o que está no token
    if (!colaborador) {
      return res.status(400).json({ erro: 'Usuário não identificado no token' });
    }

    const data = { ...req.body, colaborador };

    const novo = await sobreavisoService.criar(data);
    res.status(201).json(novo);
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao criar sobreaviso', detalhes: error.message });
  }
},

  async listar(req, res) {
    try {
      const lista = await sobreavisoService.listarTodos();
      res.json(lista);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao listar sobreavisos', detalhes: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const sobreaviso = await sobreavisoService.buscarPorId(req.params.id);
      if (!sobreaviso) return res.status(404).json({ erro: 'Sobreaviso não encontrado' });
      res.json(sobreaviso);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar sobreaviso', detalhes: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const atualizado = await sobreavisoService.atualizar(req.params.id, req.body);
      res.json(atualizado);
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao atualizar sobreaviso', detalhes: error.message });
    }
  },

  async deletar(req, res) {
    try {
      await sobreavisoService.deletar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ erro: 'Erro ao deletar sobreaviso', detalhes: error.message });
    }
  },
};

module.exports = sobreavisoController;
