const express = require('express');
const router = express.Router();
const controller = require('../controllers/tecnicoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Somente admin pode gerenciar técnicos
router.use(autenticarUsuario);

router.post('/', permitirSomente('admin','cadastro','tecnico'),controller.criar);
router.get('/',permitirSomente('admin','cadastro','visualizador','tecnico'), controller.listar);
router.put('/:id',permitirSomente('admin','cadastro'), controller.atualizar);
router.delete('/:id', permitirSomente('admin'),controller.remover);

module.exports = router;
