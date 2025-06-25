const { addToQueue } = require('../services/productQueueService');

const enqueueProduct = async (req, res, next) => {
  try {
    const product = req.body;

    if (!product.url || !product.quantity) {
      throw new Error('Invalid product data');
    }

    await addToQueue(product);
    res.status(200).json({ message: 'Product enqueued' });
  } catch (err) {
    next(err);
  }
};

module.exports = { enqueueProduct };
