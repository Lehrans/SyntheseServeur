import express from 'express';

import errors from './utils/errors.js';
import database from './utils/database.js';

import accountsRoutes from './routes/accountRoutes.js';

database();

const app = express();

app.use(express.json());

app.use('/accounts',accountsRoutes);

app.use('*', errors);

export default app;