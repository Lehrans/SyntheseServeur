import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import monsterServices from '../services/mosnterServices.js';

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });

class MonstersRoutes {
    constructor() {
        
    }
}

new MonstersRoutes();

export default router;
