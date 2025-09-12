const localizacaoService = require('../services/localizacaoService');

const localizacaoController = {
  async criar(req, res) {
    try {
      const localizacao = await localizacaoService.criar(req.body);
      res.status(201).json(localizacao);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async listar(req, res) {
    try {
      const localizacoes = await localizacaoService.listar();
      res.json(localizacoes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: 'ID da localização deve ser um número válido'
        });
      }

      const localizacao = await localizacaoService.buscarPorId(id);
      
      if (!localizacao) {
        return res.status(404).json({
          error: 'Localização não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: localizacao
      });
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  },

  async listarPorSetor(req, res) {
    try {
      const { setorId } = req.params;

      if (!setorId || isNaN(parseInt(setorId))) {
        return res.status(400).json({
          error: 'ID do setor deve ser um número válido'
        });
      }

      const localizacoes = await localizacaoService.listarPorSetor(setorId);
      
      return res.status(200).json({
        success: true,
        data: localizacoes
      });
    } catch (error) {
      console.error('Erro ao listar localizações por setor:', error);
      
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

  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nome, setorId } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: 'ID da localização deve ser um número válido'
        });
      }

      if (!nome || nome.trim() === '') {
        return res.status(400).json({
          error: 'Nome da localização é obrigatório'
        });
      }

      if (!setorId || isNaN(parseInt(setorId))) {
        return res.status(400).json({
          error: 'ID do setor deve ser um número válido'
        });
      }

      const localizacao = await localizacaoService.editar(id, {
        nome: nome.trim(),
        setorId: parseInt(setorId)
      });
      
      return res.status(200).json({
        success: true,
        message: 'Localização atualizada com sucesso',
        data: localizacao
      });
    } catch (error) {
      console.error('Erro ao editar localização:', error);
      
      if (error.message === 'Localização não encontrada' || error.message === 'Setor não encontrado') {
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
          error: 'ID da localização deve ser um número válido'
        });
      }

      const result = await localizacaoService.excluir(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Erro ao excluir localização:', error);
      
      if (error.message === 'Localização não encontrada') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      if (error.message.includes('equipamentos associados')) {
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

module.exports = localizacaoController;
