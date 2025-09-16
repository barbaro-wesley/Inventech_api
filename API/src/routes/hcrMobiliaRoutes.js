const express = require('express');
const router = express.Router();
const hcrMobiliaController = require('../controllers/hcrMobiliaController');
const {autenticarUsuario} = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');
router.use(autenticarUsuario);
router.post('/', permitirSomente('admin','cadastro'),hcrMobiliaController.criar);
router.get('/', permitirSomente('admin','cadastro'),hcrMobiliaController.listar);
router.get('/:id', permitirSomente('admin','cadastro'),hcrMobiliaController.buscarPorId);
router.put('/:id', permitirSomente('admin','cadastro'),hcrMobiliaController.atualizar);
router.delete('/:id',permitirSomente('admin','cadastro'), hcrMobiliaController.deletar);

module.exports = router;
