const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');

router.post('/', chamadoController.criar);
router.get('/', chamadoController.listar);
router.get('/:id', chamadoController.buscarPorId);
router.put('/:id', chamadoController.atualizar);
router.delete('/:id', chamadoController.deletar);

module.exports = router;