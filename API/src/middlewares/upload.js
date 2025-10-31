// src/middlewares/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Caminho para salvar os PDFs
const uploadPath = path.join(__dirname, '..', 'uploads', 'pdfs');

// Cria a pasta se não existir
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nomeUnico = `arquivo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, nomeUnico);
  },
});

// Filtra para aceitar apenas PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF são permitidos'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
