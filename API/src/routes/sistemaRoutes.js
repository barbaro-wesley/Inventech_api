const express = require('express');
const router = express.Router();
const sistemaController = require('../controllers/sistema.controller');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);

router.post('/',permitirSomente('admin'), sistemaController.criar);
router.get('/', permitirSomente('admin'),sistemaController.listar);
router.get('/:id', permitirSomente('admin'),sistemaController.buscarPorId);
router.put('/:id', permitirSomente('admin'),sistemaController.atualizar);
router.delete('/:id', permitirSomente('admin'),sistemaController.deletar);

module.exports = router;
