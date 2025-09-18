// routes/cailunRoutes.js
const { Router } = require('express');
const upload = require("../middlewares/upload");
const {
  testLoginController,
  testTokenController,
  checkConfigController,
  createFolderController,
  startSubscriptionFlowController,
  createSignatory
} = require('../controllers/cailunController');

const router = Router();
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
//fluxo de assinatura
router.post(
  "/subscription-flow",
  upload.single("file"), // campo `file` do multipart/form-data
  startSubscriptionFlowController
);

router.post('/signatories', createSignatory);
module.exports = router;