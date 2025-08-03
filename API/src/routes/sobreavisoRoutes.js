const express = require('express');
const router = express.Router();
const sobreavisoController = require('../controllers/sobreavisoController');
const autenticarUsuario = require("../middlewares/auth");
const permitirSomente = require('../middlewares/permissoes');

router.use(autenticarUsuario); 

router.post('/', permitirSomente('admin'),sobreavisoController.criar);
router.get('/', permitirSomente('admin'),sobreavisoController.listar);
router.get('/:id', permitirSomente('admin'),sobreavisoController.buscarPorId);
router.put('/:id', permitirSomente('admin'),sobreavisoController.atualizar);
router.delete('/:id', permitirSomente('admin'),sobreavisoController.deletar);

module.exports = router;