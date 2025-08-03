const express = require('express');
const router = express.Router();
const hcrAirConditioningController = require('../controllers/hcrAirConditioningController');

const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');
router.use(autenticarUsuario);

router.post('/', permitirSomente('admin','cadastro'),hcrAirConditioningController.criar);
router.get('/', permitirSomente('admin','cadastro'),hcrAirConditioningController.listar);
router.get('/:id', permitirSomente('admin','cadastro'),hcrAirConditioningController.buscarPorId);
router.put('/:id', permitirSomente('admin','cadastro'),hcrAirConditioningController.atualizar);
router.delete('/:id', permitirSomente('admin','cadastro'),hcrAirConditioningController.deletar);

module.exports = router;
