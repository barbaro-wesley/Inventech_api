const express = require('express');
const capacitacaoController = require('../controllers/capacitacao.controller');

const router = express.Router();

router.get('/', capacitacaoController.getAllCapacitacoes);
router.get('/:id', capacitacaoController.getCapacitacaoById);
router.post('/', capacitacaoController.createCapacitacao);

module.exports = router;
