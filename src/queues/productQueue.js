const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const connection = new Redis(process.env.REDIS_URL,{maxRetriesPerRequest: null});

const productQueue = new Queue('product-automation', { connection });

module.exports = { productQueue };
