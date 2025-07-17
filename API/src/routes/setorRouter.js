const express = require('express');
const router = express.Router();
const setorController = require('../controllers/setorController');
router.post('/', setorController.criar);
router.get('/', setorController.listar);
module.exports = router;