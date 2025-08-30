const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoEquipamentoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protege todas as rotas - só admin pode alterar
router.use(autenticarUsuario);

router.post('/', permitirSomente('admin','cadastro'),controller.criar);
router.get('/',permitirSomente('admin','cadastro','visualizador','tecnico'), controller.listar);
router.put('/:id',permitirSomente('admin','cadastro'), controller.atualizar);
router.delete('/:id', permitirSomente('admin','cadastro'),controller.remover);

module.exports = router;
