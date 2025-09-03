// routes/stockMovementRoutes.js
const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');

// POST /api/stock-movements - Criar nova movimentação
router.post('/', stockMovementController.create);

// GET /api/stock-movements - Listar todas as movimentações (com filtros)
// Query params: produtoId, tipo, usuarioId, dataInicio, dataFim
router.get('/', stockMovementController.findAll);

// GET /api/stock-movements/report - Relatório de movimentações
// Query params: dataInicio, dataFim, tipo
router.get('/report', stockMovementController.getMovementReport);

// GET /api/stock-movements/date-range - Movimentações por período
// Query params: dataInicio, dataFim
router.get('/date-range', stockMovementController.getMovementsByDateRange);

// GET /api/stock-movements/:id - Buscar movimentação por ID
router.get('/:id', stockMovementController.findById);

// GET /api/stock-movements/product/:produtoId - Movimentações por produto
router.get('/product/:produtoId', stockMovementController.findByProduct);

// PUT /api/stock-movements/:id - Não permitido (retorna erro 405)
router.put('/:id', stockMovementController.update);

// DELETE /api/stock-movements/:id - Não permitido (retorna erro 405)
router.delete('/:id', stockMovementController.delete);

module.exports = router;