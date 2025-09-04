// routes/equipamentosRouter.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');
const equipamentoController = require('../controllers/hcrEquipamentosMedicosController');

// Criar diretório se não existir
const uploadPath = 'uploads/pdfs';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `arquivo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

// Aceita só PDF
const fileFilter = (req, file, cb) => {
  cb(null, file.mimetype === 'application/pdf');
};

const upload = multer({ storage, fileFilter });

router.use(autenticarUsuario);
router.post(
  '/',
  permitirSomente('admin','cadastro','visualizador','tecnico'),
  upload.array('arquivos', 5),
  equipamentoController.criar
);
router.get(
  '/tipo/:tipoEquipamentoId',
  permitirSomente('admin','cadastro','visualizador','tecnico'),
  equipamentoController.listarPorTipo
);
router.get('/equipamentos-medicos/patrimonio/:numeroPatrimonio', equipamentoController.buscarPorNumeroPatrimonio);
router.get('/', permitirSomente('admin','cadastro','tecnico','visualizador'),equipamentoController.listar);
router.get('/:id',permitirSomente('admin','cadastro','visualizador','tecnico') ,equipamentoController.buscarPorId);
router.put('/:id',upload.array('arquivos'),permitirSomente('admin', 'cadastro'),equipamentoController.atualizar);
router.delete('/:id', permitirSomente('admin','cadastro'), equipamentoController.deletar);

module.exports = router;
