const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');
const hcrAirConditioningController = require('../controllers/hcrAirConditioningController');

// Criar diretório se não existir
const uploadPath = 'uploads/airconditionings';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-';
    cb(null, uniquePrefix + file.originalname);
  },
});

// Aceita só PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

router.use(autenticarUsuario);

router.post(
  '/',
  permitirSomente('admin', 'cadastro'),
  upload.array('arquivos', 5),
  (req, res, next) => {
    // Mapear os nomes dos arquivos enviados para req.body.arquivos
    if (req.files && req.files.length > 0) {
      req.body.arquivos = req.files.map(file => file.filename);
    } else {
      req.body.arquivos = [];
    }
    next();
  },
  hcrAirConditioningController.criar
);

router.get('/', permitirSomente('admin', 'cadastro'), hcrAirConditioningController.listar);
router.get('/:id', permitirSomente('admin', 'cadastro'), hcrAirConditioningController.buscarPorId);

router.put(
  '/:id',
  permitirSomente('admin', 'cadastro'),
  upload.array('arquivos', 5),
  (req, res, next) => {
    if (req.files && req.files.length > 0) {
      req.body.arquivos = req.files.map(file => file.filename);
    }
    next();
  },
  hcrAirConditioningController.atualizar
);

router.delete('/:id', permitirSomente('admin', 'cadastro'), hcrAirConditioningController.deletar);

module.exports = router;