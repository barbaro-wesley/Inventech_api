// routes/cailunRoutes.js
const { Router } = require('express');
const upload = require("../middlewares/upload");
const {autenticarUsuario} = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Create router instance FIRST
const router = Router();

// THEN apply middleware
router.use(autenticarUsuario);

const {
  testLoginController,
  testTokenController,
  checkConfigController,
  createFolderController,
  startSubscriptionFlowController,
  createSignatory
} = require('../controllers/cailunController');

router.post('/test-login', testLoginController);
router.get('/test-token', testTokenController);
router.get('/config', checkConfigController);

router.get('/', (req, res) => {
  res.json({
    message: '🔐 API de Teste do Cailun Login',
    endpoints: {
      'POST /test-login': 'Testa fazer login na API Cailun',
      'GET /test-token': 'Verifica se o token salvo ainda é válido',
      'GET /config': 'Verifica as configurações do ambiente'
    },
    usage: {
      step1: 'Primeiro, verifique GET /config',
      step2: 'Depois, teste o login POST /test-login',
      step3: 'Opcionalmente, teste o token GET /test-token'
    }
  });
});

// Criação de pastas
router.post('/folder', createFolderController);

// Fluxo de assinatura
router.post(
  "/subscription-flow",
  upload.single("file"), 
  startSubscriptionFlowController
);

router.post('/signatories', createSignatory);

module.exports = router;