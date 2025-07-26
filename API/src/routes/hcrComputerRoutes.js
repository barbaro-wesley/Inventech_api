const express = require('express');
const router = express.Router();
const controller = require('../controllers/hcrComputerController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
// router.use(autenticarUsuario);

// Listar todos
router.get('/', controller.listar);

// Criar, atualizar, excluir apenas se for admin
router.post('/', permitirSomente('admin'), controller.criar);
router.put('/:id', permitirSomente('admin'), controller.atualizar);
router.delete('/:id', permitirSomente('admin'), controller.remover);

module.exports = router;
