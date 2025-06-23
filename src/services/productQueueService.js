const { productQueue } = require('../queues/productQueue');

const addToQueue = async (productData) => {
  await productQueue.add('automate-product', productData, {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

module.exports = { addToQueue };
