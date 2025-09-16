const express = require('express');
const funcionarioController = require('../controllers/funcionario.controller.js');
const { verificarModulo } = require("../middlewares/auth.js");
const router = express.Router();

router.get('/', verificarModulo("CEP"),funcionarioController.getAllFuncionarios);
router.get('/:id', verificarModulo("CEP"),funcionarioController.getFuncionarioById);
router.post('/', verificarModulo("CEP"),funcionarioController.createFuncionario);
router.put('/:id',verificarModulo("CEP"), funcionarioController.updateFuncionario);
router.delete('/:id', verificarModulo("CEP"),funcionarioController.deleteFuncionario);

module.exports = router;
