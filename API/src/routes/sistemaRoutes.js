const express = require('express');
const router = express.Router();
const sistemaController = require('../controllers/sistema.controller');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);

router.post('/', sistemaController.criar);
router.get('/', sistemaController.listar);
router.get('/:id', sistemaController.buscarPorId);
router.put('/:id', sistemaController.atualizar);
router.delete('/:id', sistemaController.deletar);

module.exports = router;
