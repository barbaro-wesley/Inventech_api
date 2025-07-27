const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.get('/status/abertos', chamadoController.listarAbertos);
router.get('/status/finalizados', chamadoController.listarFinalizados);
router.post('/', chamadoController.criar);
router.get('/', chamadoController.listar);
router.get('/:id', chamadoController.buscarPorId);
router.put('/:id', chamadoController.atualizar);
router.put('/:id/finalizar', chamadoController.finalizar);
router.delete('/:id', chamadoController.deletar);

module.exports = router;