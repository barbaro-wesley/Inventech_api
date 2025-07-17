const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const autenticarUsuario = require('../middlewares/auth'); 
const permitirSomente = require('../middlewares/permissoes');

router.use(autenticarUsuario);


router.post('/',autenticarUsuario, permitirSomente('admin'), ordemServicoController.criar);


router.get('/', ordemServicoController.listar);


router.get('/:id', ordemServicoController.buscarPorId);


router.put('/:id', autenticarUsuario, permitirSomente('admin'),ordemServicoController.atualizar);


router.delete('/:id',autenticarUsuario, permitirSomente('admin'), ordemServicoController.deletar);

module.exports = router;