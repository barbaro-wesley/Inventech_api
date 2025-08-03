const express = require('express');
const router = express.Router();
const controller = require('../controllers/grupoManutencaoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protegido: apenas admins
router.use(autenticarUsuario, permitirSomente('admin'));

router.post('/', permitirSomente('admin'),controller.criar);
router.get('/', permitirSomente('admin'),controller.listar);
router.put('/:id',permitirSomente('admin') ,controller.atualizar);
router.delete('/:id', permitirSomente('admin'),controller.deletar);

module.exports = router;
