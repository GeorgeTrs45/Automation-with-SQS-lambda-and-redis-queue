require('dotenv').config();
const app = require('./src/app');
const { startWorker } = require('./src/worker');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Express server running at http://localhost:${PORT}`);
  startWorker(); // start the queue consumer in same process
});
