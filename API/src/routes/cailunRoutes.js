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
  createSignatory,
  getFoldersController,
  getFolderByIdController,
  getFolderFilesController
} = require('../controllers/cailunController');

router.post('/test-login', testLoginController);
router.get('/test-token', testTokenController);
router.get('/config', checkConfigController);


// Criação de pastas
router.post('/folder', createFolderController);
router.get('/folders', getFoldersController);
router.get('/folder/:id', getFolderByIdController);

router.get('/folder/:folderId/files', getFolderFilesController);



// Fluxo de assinatura
router.post(
  "/subscription-flow",
  upload.single("file"), 
  startSubscriptionFlowController
);
// cria signaatarios
router.post('/signatories', createSignatory);

module.exports = router;