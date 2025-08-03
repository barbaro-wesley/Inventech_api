const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.get('/status/abertos', permitirSomente('admin'),chamadoController.listarAbertos);
router.get('/status/finalizados',permitirSomente('admin'), chamadoController.listarFinalizados);
router.post('/', permitirSomente('admin'),chamadoController.criar);
router.get('/', permitirSomente('admin'),chamadoController.listar);
router.get('/:id', permitirSomente('admin'),chamadoController.buscarPorId);
router.put('/:id', permitirSomente('admin'),chamadoController.atualizar);
router.put('/:id/finalizar', permitirSomente('admin'),chamadoController.finalizar);
router.delete('/:id', permitirSomente('admin'),chamadoController.deletar);

module.exports = router;