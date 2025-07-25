const express = require('express');
const router = express.Router();
const sistemaController = require('../controllers/sistema.controller');

router.post('/', sistemaController.criar);
router.get('/', sistemaController.listar);
router.get('/:id', sistemaController.buscarPorId);
router.put('/:id', sistemaController.atualizar);
router.delete('/:id', sistemaController.deletar);

module.exports = router;
