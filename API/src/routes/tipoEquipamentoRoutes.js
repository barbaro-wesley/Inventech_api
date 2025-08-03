const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoEquipamentoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protege todas as rotas - só admin pode alterar
router.use(autenticarUsuario, permitirSomente('admin'));

router.post('/', permitirSomente('admin'),controller.criar);
router.get('/',permitirSomente('admin'), controller.listar);
router.put('/:id',permitirSomente('admin'), controller.atualizar);
router.delete('/:id', permitirSomente('admin'),controller.remover);

module.exports = router;
