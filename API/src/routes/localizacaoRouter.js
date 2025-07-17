const express = require('express');
const router = express.Router();
const localizacaoController = require('../controllers/localizacaoController');
router.post('/', localizacaoController.criar);
router.get('/', localizacaoController.listar);
module.exports = router;