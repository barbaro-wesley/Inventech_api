const express = require('express');
const funcionarioController = require('../controllers/funcionario.controller.js');
const { verificarModulo } = require("../middlewares/auth.js");
const router = express.Router();

// Criar funcionário
// POST /api/funcionarios
router.post('/',funcionarioController.createFuncionario);

// Buscar todos os funcionários (com filtros opcionais)
// GET /api/funcionarios?setorId=1&nome=João&cargo=Operador
router.get('/', funcionarioController.getAllFuncionarios);

// Buscar funcionário por ID
// GET /api/funcionarios/1
router.get('/:id',funcionarioController.getFuncionarioById);

// Atualizar funcionário
// PUT /api/funcionarios/1
router.put('/:id',funcionarioController.updateFuncionario);

// Buscar funcionários por setor
// GET /api/funcionarios/setor/1
router.get('/setor/:setorId', funcionarioController.getFuncionariosBySetor);

// Deletar funcionário
// DELETE /api/funcionarios/1
router.delete('/:id', funcionarioController.deleteFuncionario);

module.exports = router;
