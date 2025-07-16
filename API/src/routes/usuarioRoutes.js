const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

router.post(
  '/cadastro',
  autenticarUsuario,             
  permitirSomente('admin'),      
  usuarioController.criarUsuario
);
router.post('/login', usuarioController.login);

// Apenas usuários logados
router.get('/me', autenticarUsuario, usuarioController.perfil);

// Apenas admins podem ver todos os usuários
router.get('/', autenticarUsuario, permitirSomente('admin'), usuarioController.listarUsuarios);

module.exports = router;
