const express = require('express');
const tipoController = require('../controllers/tipoDocumento.controller');
const { verificarModulo } = require("../middlewares/auth.js");

const router = express.Router();

router.get('/',tipoController.getAllTipos);
router.get('/:id',verificarModulo("CEP"), tipoController.getTipoById);
router.post('/',tipoController.createTipo);
router.put('/:id',verificarModulo("CEP"), tipoController.updateTipo);
router.delete('/:id',verificarModulo("CEP"), tipoController.deleteTipo);

module.exports = router;
