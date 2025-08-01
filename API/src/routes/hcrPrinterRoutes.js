const express = require('express');
const router = express.Router();
const printerController = require('../controllers/hcrPrinterController');

router.get('/', printerController.getAll);
router.get('/:id', printerController.getById);
router.post('/', printerController.create);
router.put('/:id', printerController.update);
router.delete('/:id', printerController.remove);

module.exports = router;
