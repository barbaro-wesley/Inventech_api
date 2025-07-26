const express = require('express');
const router = express.Router();
const incidenteController = require('../controllers/incidenteController');

router.post('/', incidenteController.criar);
router.get('/', incidenteController.listar);
router.get('/:id', incidenteController.buscarPorId);
router.put('/:id', incidenteController.atualizar);
router.delete('/:id', incidenteController.deletar);

module.exports = router;
