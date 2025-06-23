const express = require('express');
const { enqueueProduct } = require('../controllers/productController');

const router = express.Router();

router.post('/enqueue', enqueueProduct);

module.exports = router;
