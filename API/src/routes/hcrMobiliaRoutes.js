const express = require('express');
const router = express.Router();
const hcrMobiliaController = require('../controllers/hcrMobiliaController');

router.post('/', hcrMobiliaController.criar);
router.get('/', hcrMobiliaController.listar);
router.get('/:id', hcrMobiliaController.buscarPorId);
router.put('/:id', hcrMobiliaController.atualizar);
router.delete('/:id', hcrMobiliaController.deletar);

module.exports = router;
