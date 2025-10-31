const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const {autenticarUsuario} = require('../middlewares/auth'); 
const permitirSomente = require('../middlewares/permissoes');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = 'uploads/';

if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads';

    if (file.mimetype === 'application/pdf') {
      dest = 'uploads/pdfs';
    }

    // cria o diretório, se não existir
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter });

router.use(autenticarUsuario);

// Rotas estáticas sem parâmetros (organizadas por método HTTP)
router.get('/', ordemServicoController.listar);
router.get('/tecnico', permitirSomente('admin', 'tecnico', 'cadastro'), ordemServicoController.listarPorTecnico);
router.get('/ordens/preventivas', permitirSomente('admin', 'tecnico', 'cadastro'), ordemServicoController.listarPreventivasPorTecnico);
router.get('/minhas-os', ordemServicoController.listarMinhasOS);
router.get('/preview-lote', ordemServicoController.previewCriacaoLote);

router.post('/', permitirSomente('admin', 'cadastro', 'visualizador', 'tecnico'), upload.array('arquivos', 5), ordemServicoController.criar);
router.post('/criar-lote', ordemServicoController.criarOSEmLote);
router.post('/acompanhamento', upload.array('arquivos', 5), ordemServicoController.criarAcompanhamentoController);

// Rotas com parâmetros específicos (mais específicas primeiro)
router.get('/acompanhamento/:id', ordemServicoController.listarAcompanhamentosController); // Corrigido: adicionado '/' antes de 'acompanhamento'

router.put('/:id/concluir', permitirSomente('admin', 'tecnico', 'cadastro'), upload.array('arquivos', 5), ordemServicoController.concluir);
router.put('/:id/iniciar', permitirSomente('admin', 'tecnico', 'cadastro'), ordemServicoController.iniciar);
router.put('/:id/cancelar', permitirSomente('admin', 'tecnico', 'cadastro'), ordemServicoController.cancelar);

// Rotas dinâmicas gerais (por último)
router.get('/:id', permitirSomente('admin', 'cadastro', 'tecnico', 'visualizador'), ordemServicoController.buscarPorId);
router.put('/ordens-servico/:id', permitirSomente('admin', 'cadastro'), ordemServicoController.atualizar); // Mantido como está, mas considere padronizar para '/:id'
router.delete('/:id', permitirSomente('admin'), ordemServicoController.deletar);

module.exports = router;