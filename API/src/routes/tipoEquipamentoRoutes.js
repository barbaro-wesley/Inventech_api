const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoEquipamentoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protege todas as rotas - só admin pode alterar
router.use(autenticarUsuario, permitirSomente('admin'));

router.post('/', controller.criar);
router.get('/', controller.listar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;
