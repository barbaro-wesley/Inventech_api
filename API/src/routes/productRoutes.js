// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// POST /api/products - Criar novo produto
router.post('/', productController.create);

// GET /api/products - Listar todos os produtos (com filtros)
// Query params: categoriaId, nome, lowStock
router.get('/', productController.findAll);

// GET /api/products/low-stock - Produtos com estoque baixo
router.get('/low-stock', productController.getLowStock);

// GET /api/products/stock-report - Relatório de estoque
router.get('/stock-report', productController.getStockReport);

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', productController.findById);

// PUT /api/products/:id - Atualizar produto
router.put('/:id', productController.update);

// DELETE /api/products/:id - Excluir produto
router.delete('/:id', productController.delete);

module.exports = router;