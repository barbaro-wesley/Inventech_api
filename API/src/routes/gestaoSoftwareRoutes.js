// routes/gestaoSoftwareRoutes.js
const express = require('express');
const router = express.Router();
const gestaoSoftwareController = require('../controllers/gestaoSoftwareController');
const { body, param, query } = require('express-validator');

// Validações para criação
const validacoesCriar = [
  body('equipamentoId')
    .isInt({ min: 1 })
    .withMessage('ID do equipamento deve ser um número inteiro positivo'),
    
  body('software')
    .notEmpty()
    .withMessage('Nome do software é obrigatório')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do software deve ter entre 2 e 200 caracteres'),
    
  body('versao')
    .notEmpty()
    .withMessage('Versão é obrigatória')
    .isLength({ min: 1, max: 50 })
    .withMessage('Versão deve ter entre 1 e 50 caracteres'),
    
  body('dataInstalacao')
    .isISO8601()
    .withMessage('Data de instalação deve estar no formato ISO 8601'),
    
  body('responsavel')
    .notEmpty()
    .withMessage('Responsável é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do responsável deve ter entre 2 e 100 caracteres'),
    
  body('licencaSerial')
    .notEmpty()
    .withMessage('Serial da licença é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial da licença deve ter entre 1 e 100 caracteres'),
    
  body('statusLicenca')
    .notEmpty()
    .withMessage('Status da licença é obrigatório')
    .isIn(['ATIVA', 'EXPIRADA', 'SUSPENSA', 'CANCELADA'])
    .withMessage('Status da licença deve ser ATIVA, EXPIRADA, SUSPENSA ou CANCELADA'),
    
  body('dataExpiracao')
    .isISO8601()
    .withMessage('Data de expiração deve estar no formato ISO 8601'),
    
  body('motivoInstalacao')
    .notEmpty()
    .withMessage('Motivo da instalação é obrigatório')
    .isLength({ min: 5, max: 500 })
    .withMessage('Motivo da instalação deve ter entre 5 e 500 caracteres'),
    
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
];

// Validações para atualização (campos opcionais)
const validacoesAtualizar = [
  body('equipamentoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do equipamento deve ser um número inteiro positivo'),
    
  body('software')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do software deve ter entre 2 e 200 caracteres'),
    
  body('versao')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Versão deve ter entre 1 e 50 caracteres'),
    
  body('dataInstalacao')
    .optional()
    .isISO8601()
    .withMessage('Data de instalação deve estar no formato ISO 8601'),
    
  body('responsavel')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do responsável deve ter entre 2 e 100 caracteres'),
    
  body('licencaSerial')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial da licença deve ter entre 1 e 100 caracteres'),
    
  body('statusLicenca')
    .optional()
    .isIn(['ATIVA', 'EXPIRADA', 'SUSPENSA', 'CANCELADA'])
    .withMessage('Status da licença deve ser ATIVA, EXPIRADA, SUSPENSA ou CANCELADA'),
    
  body('dataExpiracao')
    .optional()
    .isISO8601()
    .withMessage('Data de expiração deve estar no formato ISO 8601'),
    
  body('motivoInstalacao')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Motivo da instalação deve ter entre 5 e 500 caracteres'),
    
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
];

// Validação para parâmetros ID
const validacaoId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

// Validação para equipamento ID
const validacaoEquipamentoId = [
  param('equipamentoId')
    .isInt({ min: 1 })
    .withMessage('ID do equipamento deve ser um número inteiro positivo')
];
const validacaoQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
    
  query('equipamentoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do equipamento deve ser um número inteiro positivo'),
    
  query('statusLicenca')
    .optional()
    .isIn(['ATIVA', 'EXPIRADA', 'SUSPENSA', 'CANCELADA'])
    .withMessage('Status da licença deve ser ATIVA, EXPIRADA, SUSPENSA ou CANCELADA'),
    
  query('dias')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Dias deve ser um número entre 1 e 365')
];

// Rotas
router.post('/', validacoesCriar, gestaoSoftwareController.criar);
router.get('/', validacaoQuery, gestaoSoftwareController.listar);
router.get('/relatorio/status', gestaoSoftwareController.relatorioPorStatus);
router.get('/licencas-expirando', validacaoQuery, gestaoSoftwareController.licencasExpirando);
router.get('/equipamento/:equipamentoId', validacaoEquipamentoId, gestaoSoftwareController.buscarPorEquipamento);
router.get('/:id', validacaoId, gestaoSoftwareController.buscarPorId);
router.put('/:id', validacaoId, validacoesAtualizar, gestaoSoftwareController.atualizar);
router.delete('/:id', validacaoId, gestaoSoftwareController.deletar);

module.exports = router;