const express = require('express');
const router = express.Router();
const controller = require('../controllers/grupoManutencaoController');
const {autenticarUsuario} = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protegido: apenas admins
router.use(autenticarUsuario);

router.post('/',permitirSomente('admin','cadastro'),controller.criar);
router.get('/',permitirSomente('admin','cadastro','tecnico'),controller.listar);
router.put('/:id' ,permitirSomente('admin','cadastro'),controller.atualizar);
router.delete('/:id',permitirSomente('admin','cadastro'),controller.deletar);

module.exports = router;
