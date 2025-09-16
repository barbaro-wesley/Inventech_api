const express = require('express');
const capacitacaoController = require('../controllers/capacitacao.controller');
const { verificarModulo } = require("../middlewares/auth.js");

const router = express.Router();

router.get('/', verificarModulo("CEP"),capacitacaoController.getAllCapacitacoes);
router.get('/:id', verificarModulo("CEP"),capacitacaoController.getCapacitacaoById);
router.post('/', verificarModulo("CEP"),capacitacaoController.createCapacitacao);

module.exports = router;
