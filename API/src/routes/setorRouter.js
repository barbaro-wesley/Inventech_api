const express = require('express');
const router = express.Router();
const setorController = require('../controllers/setorController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.post('/', permitirSomente('admin'),setorController.criar);
router.get('/', setorController.listar);
module.exports = router;