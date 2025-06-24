const { productQueue } = require('../queues/productQueue');

const addToQueue = async (productData) => {
  await productQueue.add('automate-product', productData, {
    jobId: productData.uuid,
    removeOnComplete: 50, //keeps last 50 jobs data in redis
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

module.exports = { addToQueue };
