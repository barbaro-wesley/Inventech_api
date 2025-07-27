const express = require('express');
const router = express.Router();
const localizacaoController = require('../controllers/localizacaoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.post('/', localizacaoController.criar);
router.get('/', localizacaoController.listar);
module.exports = router;