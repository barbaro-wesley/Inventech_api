// routes/tipoEquipamentoRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoEquipamentoController');
const {autenticarUsuario} = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protege todas as rotas
router.use(autenticarUsuario);

// Rotas existentes
router.post('/', permitirSomente('admin','cadastro'), controller.criar);
router.get('/', permitirSomente('admin','cadastro','visualizador','tecnico'), controller.listar);
router.put('/:id', permitirSomente('admin','cadastro'), controller.atualizar);
router.delete('/:id', permitirSomente('admin','cadastro'), controller.remover);

// Novas rotas para contagem de equipamentos
/**
 * GET /api/tipos-equipamento/contagem
 * Retorna a contagem básica de equipamentos por tipo
 */
router.get('/contagem', permitirSomente('admin','cadastro','visualizador','tecnico'), controller.obterContagemPorTipo);

/**
 * GET /api/tipos-equipamento/contagem/detalhada
 * Retorna contagem detalhada com informações adicionais do tipo
 */
router.get('/contagem/detalhada', permitirSomente('admin','cadastro','visualizador','tecnico'), controller.obterContagemDetalhada);

/**
 * GET /api/tipos-equipamento/contagem/resumo
 * Retorna resumo geral com totais e contagem por tipo
 */
router.get('/contagem/resumo', permitirSomente('admin','cadastro','visualizador','tecnico'), controller.obterResumoGeral);

/**
 * GET /api/tipos-equipamento/contagem/:id
 * Retorna informações específicas de um tipo de equipamento
 */
router.get('/contagem/:id', permitirSomente('admin','cadastro','visualizador','tecnico'), controller.obterContagemPorTipoEspecifico);

module.exports = router;