const { Worker } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const connection = new Redis(process.env.REDIS_URL, {maxRetriesPerRequest: null});

function startWorker() {
  const worker = new Worker(
    'product-automation',
    async (job) => {
      const { url, quantity, name } = job.data;

      console.log(`🛠️ Automating ${name || 'product'} (${quantity}) at ${url}`);
      await new Promise((r) => setTimeout(r, 3000));
      console.log(`✅ Job ${job.id} done`);
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
  });
}

module.exports = { startWorker };
