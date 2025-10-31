const express = require('express');
const router = express.Router();
const localizacaoController = require('../controllers/localizacaoController');
const {autenticarUsuario} = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Apenas usuários logados podem acessar
router.use(autenticarUsuario);
router.post('/',permitirSomente('admin','cadastro'), localizacaoController.criar);
router.get('/:id', localizacaoController.buscarPorId);
router.get('/', localizacaoController.listar);
router.get('/setor/:setorId', localizacaoController.listarPorSetor);
router.put('/:id', permitirSomente('admin','cadastro'),localizacaoController.editar);
router.delete('/:id', permitirSomente('admin','cadastro'),localizacaoController.excluir);

module.exports = router;