// routes/productCategoryRoutes.js
const express = require('express');
const router = express.Router();
const productCategoryController = require('../controllers/productCategoryController');

// POST /api/categories - Criar nova categoria
router.post('/', productCategoryController.create);

// GET /api/categories - Listar todas as categorias
router.get('/', productCategoryController.findAll);

// GET /api/categories/:id - Buscar categoria por ID
router.get('/:id', productCategoryController.findById);

// PUT /api/categories/:id - Atualizar categoria
router.put('/:id', productCategoryController.update);

// DELETE /api/categories/:id - Excluir categoria
router.delete('/:id', productCategoryController.delete);

module.exports = router;