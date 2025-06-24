const express = require('express');
const { enqueueProduct } = require('../controllers/productController');
const { getProductById, updateFeedback, removeVendor } = require('../controllers/productDataController');

const router = express.Router();

router.post('/enqueue', enqueueProduct);
router.get('/data/:product_id', getProductById);
router.patch('/data/:product_id/feedback', updateFeedback);
router.patch('/data/:product_id/remove-vendor', removeVendor);
module.exports = router;
