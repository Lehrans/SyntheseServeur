import express from 'express';

import errors from './utils/errors.js';
import database from './utils/database.js';

import explorersRoutes from './routes/explorerRoutes.js';
import explorationsRoutes from './routes/explorationRoutes.js';

database();

const app = express();

app.use(express.json());

app.use('/explorers',explorersRoutes);
app.use('/explorations',explorationsRoutes);

app.use('*', errors);

export default app;