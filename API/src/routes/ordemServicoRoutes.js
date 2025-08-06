const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const autenticarUsuario = require('../middlewares/auth'); 
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
router.get('/tecnico', autenticarUsuario, permitirSomente('admin', 'tecnico','cadastro'), ordemServicoController.listarPorTecnico);

router.post('/',autenticarUsuario, permitirSomente('admin','cadastro'),upload.array('arquivos', 5),ordemServicoController.criar);
router.get('/', ordemServicoController.listar);
router.get('/:id', permitirSomente('admin','cadastro','tecnico'),ordemServicoController.buscarPorId);
router.put('/:id', autenticarUsuario, permitirSomente('admin','cadastro'),ordemServicoController.atualizar);
router.delete('/:id',autenticarUsuario, permitirSomente('admin'), ordemServicoController.deletar);
router.put(
  '/:id/concluir',
  autenticarUsuario,
  permitirSomente('admin', 'tecnico','cadastro'),
  upload.array('arquivos',5), // isso aqui permite receber arquivos + campos textuais no body
  ordemServicoController.concluir
);

module.exports = router;