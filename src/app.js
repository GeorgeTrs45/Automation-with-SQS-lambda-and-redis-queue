const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { productQueue } = require('./queues/productQueue');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);
app.use(errorHandler);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(productQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

module.exports = app;
