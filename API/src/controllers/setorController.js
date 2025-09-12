const setorService = require('../services/setorService');

const setorController = {
  async criar(req, res) {
    try {
      const setor = await setorService.criar(req.body);
      res.status(201).json(setor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async listar(req, res) {
    try {
      const setores = await setorService.listar();
      res.json(setores);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: 'ID do setor deve ser um número válido'
        });
      }

      if (!nome || nome.trim() === '') {
        return res.status(400).json({
          error: 'Nome do setor é obrigatório'
        });
      }

      const setor = await setorService.editar(id, { nome: nome.trim() });
      
      return res.status(200).json({
        success: true,
        message: 'Setor atualizado com sucesso',
        data: setor
      });
    } catch (error) {
      console.error('Erro ao editar setor:', error);
      
      if (error.message === 'Setor não encontrado') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },
async excluir(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: 'ID do setor deve ser um número válido'
        });
      }

      const result = await setorService.excluir(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      
      if (error.message === 'Setor não encontrado') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      if (error.message.includes('localizações associadas')) {
        return res.status(400).json({
          error: error.message
        });
      }
      
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = setorController;
