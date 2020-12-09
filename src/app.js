import express from 'express';

import errors from './utils/errors.js';
import database from './utils/database.js';

import explorersRoutes from './routes/explorerRoutes.js';

database();

const app = express();

app.use(express.json());

app.use('/explorers',explorersRoutes);

app.use('*', errors);

export default app;