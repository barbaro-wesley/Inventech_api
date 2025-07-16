const express = require('express');
const router = express.Router();
const controller = require('../controllers/grupoManutencaoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Protegido: apenas admins
router.use(autenticarUsuario, permitirSomente('admin'));

router.post('/', controller.criar);
router.get('/', controller.listar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

module.exports = router;
