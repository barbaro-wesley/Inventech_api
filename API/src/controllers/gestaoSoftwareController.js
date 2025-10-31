// controllers/gestaoSoftwareController.js
const gestaoSoftwareService = require('../services/gestaoSoftwareService');
const { validationResult } = require('express-validator');

class GestaoSoftwareController {
  async criar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          erro: 'Dados inválidos',
          detalhes: errors.array()
        });
      }

      const gestaoSoftware = await gestaoSoftwareService.criarGestaoSoftware(req.body);
      
      res.status(201).json({
        sucesso: true,
        mensagem: 'Gestão de software criada com sucesso',
        dados: gestaoSoftware
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async listar(req, res) {
    try {
      const { page = 1, limit = 10, software, statusLicenca, equipamentoId, responsavel } = req.query;
      
      const filtros = {};
      if (software) filtros.software = software;
      if (statusLicenca) filtros.statusLicenca = statusLicenca;
      if (equipamentoId) filtros.equipamentoId = equipamentoId;
      if (responsavel) filtros.responsavel = responsavel;

      const resultado = await gestaoSoftwareService.buscarTodos(
        parseInt(page),
        parseInt(limit),
        filtros
      );

      res.status(200).json({
        sucesso: true,
        ...resultado
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const gestaoSoftware = await gestaoSoftwareService.buscarPorId(id);
      
      res.status(200).json({
        sucesso: true,
        dados: gestaoSoftware
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async buscarPorEquipamento(req, res) {
    try {
      const { equipamentoId } = req.params;
      const gestaoSoftware = await gestaoSoftwareService.buscarPorEquipamento(equipamentoId);
      
      res.status(200).json({
        sucesso: true,
        dados: gestaoSoftware
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async atualizar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          erro: 'Dados inválidos',
          detalhes: errors.array()
        });
      }

      const { id } = req.params;
      const gestaoSoftware = await gestaoSoftwareService.atualizar(id, req.body);
      
      res.status(200).json({
        sucesso: true,
        mensagem: 'Gestão de software atualizada com sucesso',
        dados: gestaoSoftware
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 400;
      res.status(statusCode).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await gestaoSoftwareService.deletar(id);
      
      res.status(200).json({
        sucesso: true,
        mensagem: 'Gestão de software deletada com sucesso'
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async licencasExpirando(req, res) {
    try {
      const { dias = 30 } = req.query;
      const licencas = await gestaoSoftwareService.buscarLicencasExpirandoEm(parseInt(dias));
      
      res.status(200).json({
        sucesso: true,
        mensagem: `Licenças expirando em ${dias} dias`,
        dados: licencas,
        total: licencas.length
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async relatorioPorStatus(req, res) {
    try {
      const relatorio = await gestaoSoftwareService.relatorioPorStatus();
      
      res.status(200).json({
        sucesso: true,
        dados: relatorio
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }
}

module.exports = new GestaoSoftwareController();