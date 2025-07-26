const express = require('express');
const router = express.Router();
const sobreavisoController = require('../controllers/sobreavisoController');
const autenticarUsuario = require("../middlewares/auth");

router.use(autenticarUsuario); 

router.post('/', sobreavisoController.criar);
router.get('/', sobreavisoController.listar);
router.get('/:id', sobreavisoController.buscarPorId);
router.put('/:id', sobreavisoController.atualizar);
router.delete('/:id', sobreavisoController.deletar);

module.exports = router;