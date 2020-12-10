import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import explorationServices from '../services/explorationServices.js';

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });

class ExplorationsRoutes {
    constructor() {
        router.post('/:monster', authenticateJWT, this.post);
    }

    async post(req, res, next) {
        try {
            let exploration;
            if(req.params.monster === 'false' && req.body.vault === undefined)
            {
                //Aucun monstre capturé     
                exploration = await explorationServices.create(req.body);
            }
            else{
                //L'utilisateur a choisi de capturé le monstre
            }

            exploration = exploration.toObject({ getters: false, virtuals: false });
            exploration = explorationServices.transform(exploration);
            res.status(201).json(exploration);

        } catch (err) {
            return next(httpErrors.InternalServerError(err));
        }
    }
}

new ExplorationsRoutes();

export default router;
