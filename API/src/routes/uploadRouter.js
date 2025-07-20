const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

router.post('/', upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado ou tipo inválido' });
  }

  res.status(201).json({
    mensagem: 'Upload realizado com sucesso!',
    caminho: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
