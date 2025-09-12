const express = require('express');
const router = express.Router();
const setorController = require('../controllers/setorController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.post('/', permitirSomente('admin','cadastro'),setorController.criar);
router.get('/', setorController.listar);
router.put('/:id',permitirSomente('admin','cadastro'), setorController.editar);
router.delete('/:id',permitirSomente('admin','cadastro'), setorController.excluir);
module.exports = router;