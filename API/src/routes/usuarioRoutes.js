const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const {autenticarUsuario} = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');
const {verificarAdmin} = require("../middlewares/auth")
router.post(
  '/cadastro',
  autenticarUsuario,             
  permitirSomente('admin'),      
  usuarioController.criarUsuario
);
router.post('/login', usuarioController.login);
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ mensagem: 'Logout realizado com sucesso' });
});
router.get('/disponiveis',autenticarUsuario, permitirSomente('admin'),usuarioController.listarTecnicosDisponiveis)

// Apenas usuários logados
router.get('/me', autenticarUsuario, usuarioController.perfil);

// Apenas admins podem ver todos os usuários
router.get('/', autenticarUsuario, permitirSomente('admin'), usuarioController.listarUsuarios);
router.put('/:usuarioId', 
  autenticarUsuario,    // 1º: Verificar se está logado
  verificarAdmin,       // 2º: Verificar se é admin
  usuarioController.atualizarUsuario  // 3º: Executar a atualização
);
router.put('/:usuarioId/redefinir-senha', 
  autenticarUsuario, 
  permitirSomente('admin'), 
  usuarioController.redefinirSenha
);
router.post(
  "/vincular-modulo", usuarioController.vincularModulo
);


module.exports = router;
