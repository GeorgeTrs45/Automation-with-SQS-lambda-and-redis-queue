const express = require('express');
const { enqueueProduct } = require('../controllers/productQueueController');
const { getProductById, updateFeedback, removeVendor, automateController } = require('../controllers/productDataController');
const { apiKeyAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(apiKeyAuth);

router.post('/enqueue', enqueueProduct);
router.post('/data/automate', automateController);
router.get('/data/:product_id', getProductById);
router.patch('/data/:product_id/feedback', updateFeedback);
router.patch('/data/:product_id/remove-vendor', removeVendor);
module.exports = router;
