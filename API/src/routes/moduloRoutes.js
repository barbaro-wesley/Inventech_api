const express = require('express');
const router = express.Router();
const moduloController = require('../controllers/moduloController');
router.post('/', moduloController.criarModulo);

router.get('/', moduloController.listarModulos);

router.get('/:id', moduloController.buscarModulo);

router.put('/:id', moduloController.atualizarModulo);

router.delete('/:id', moduloController.deletarModulo);

module.exports = router;
