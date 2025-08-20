const express = require('express');
const tipoController = require('../controllers/tipoDocumento.controller');

const router = express.Router();

router.get('/', tipoController.getAllTipos);
router.get('/:id', tipoController.getTipoById);
router.post('/', tipoController.createTipo);
router.put('/:id', tipoController.updateTipo);
router.delete('/:id', tipoController.deleteTipo);

module.exports = router;
