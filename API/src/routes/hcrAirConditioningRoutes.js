const express = require('express');
const router = express.Router();
const hcrAirConditioningController = require('../controllers/hcrAirConditioningController');

// const autenticarUsuario = require('../middlewares/auth');
// const permitirSomente = require('../middlewares/permissoes');
// router.use(autenticarUsuario);

router.post('/', hcrAirConditioningController.criar);
router.get('/', hcrAirConditioningController.listar);
router.get('/:id', hcrAirConditioningController.buscarPorId);
router.put('/:id', hcrAirConditioningController.atualizar);
router.delete('/:id', hcrAirConditioningController.deletar);

module.exports = router;
