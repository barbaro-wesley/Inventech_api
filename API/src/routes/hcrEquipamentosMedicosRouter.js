const express = require('express');
const router = express.Router();
const controller = require('../controllers/hcrEquipamentosMedicosController');
const auth = require('../middlewares/auth'); 
const permitirSomente = require('../middlewares/permissoes');
// Apenas usuários logados podem acessar
router.post('/', auth, controller.criar);
router.get('/', controller.listar);
router.get('/:id', auth, controller.buscarPorId);
router.put('/:id', auth, controller.atualizar);
router.delete('/:id', auth, controller.deletar);

module.exports = router;
