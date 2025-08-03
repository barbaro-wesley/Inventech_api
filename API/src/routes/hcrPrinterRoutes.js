const express = require('express');
const router = express.Router();
const printerController = require('../controllers/hcrPrinterController');
const permitirSomente = require('../middlewares/permissoes');
const autenticarUsuario = require('../middlewares/auth');

router.use(autenticarUsuario);
router.get('/', permitirSomente('admin'),printerController.getAll);
router.get('/:id', permitirSomente('admin'),printerController.getById);
router.post('/',permitirSomente('admin') ,printerController.create);
router.put('/:id', permitirSomente('admin'),printerController.update);
router.delete('/:id', permitirSomente('admin','cadastro'),printerController.remove);

module.exports = router;
