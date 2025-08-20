const express = require('express');
const funcionarioController = require('../controllers/funcionario.controller.js');

const router = express.Router();

router.get('/', funcionarioController.getAllFuncionarios);
router.get('/:id', funcionarioController.getFuncionarioById);
router.post('/', funcionarioController.createFuncionario);
router.put('/:id', funcionarioController.updateFuncionario);
router.delete('/:id', funcionarioController.deleteFuncionario);

module.exports = router;
