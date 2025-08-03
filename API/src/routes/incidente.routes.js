const express = require('express');
const router = express.Router();
const incidenteController = require('../controllers/incidenteController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.post('/', permitirSomente('admin'),incidenteController.criar);
router.get('/', permitirSomente('admin'),incidenteController.listar);
router.get('/:id',permitirSomente('admin'), incidenteController.buscarPorId);
router.put('/:id',permitirSomente('admin'), incidenteController.atualizar);
router.delete('/:id',permitirSomente('admin'), incidenteController.deletar);

module.exports = router;
