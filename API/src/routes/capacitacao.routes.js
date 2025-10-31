const express = require('express');
const capacitacaoController = require('../controllers/capacitacao.controller');
const { verificarModulo } = require("../middlewares/auth.js");

const router = express.Router();

router.get('/',capacitacaoController.getAllCapacitacoes);
router.get('/:id', verificarModulo("CEP"),capacitacaoController.getCapacitacaoById);
router.post('/',capacitacaoController.createCapacitacao);

module.exports = router;
