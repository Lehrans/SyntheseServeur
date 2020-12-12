import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import explorationServices from '../services/explorationServices.js';
import explorerServices from '../services/explorerServices.js';
import monsterServices from '../services/monsterServices.js';

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });

class ExplorationsRoutes {
    constructor() {
        router.post('/', authenticateJWT, this.post);
    }

    async post(req, res, next) {
        try {
            let exploration = {};
            if(req.query.monster === 'false' && req.query.vault === 'false')
            {
                //Aucun monstre capturé et vault und     
                req.body.explorer = await explorerServices.retrieveId(req.user.username);
                exploration = await explorationServices.create(req.body);
                exploration = exploration.toObject({ getters: false, virtuals: false });
                exploration = explorationServices.transform(exploration);
            }
            else if (req.query.monster === 'true'  && req.query.vault === 'false'){

                req.body.explorer = await explorerServices.retrieveId(req.user.username);
                exploration = await explorationServices.create(req.body);
                let monster = await monsterServices.create(req.body.monster, req.body.explorer, exploration._id);
                
                monster = monster.toObject({ getters: false, virtuals: false });
                monster = monsterServices.transform(monster);
                
                exploration = exploration.toObject({ getters: false, virtuals: false });
                exploration.monster = monster;
                exploration = explorationServices.transform(exploration);

            }

            res.status(201).json(exploration);

        } catch (err) {
            return next(httpErrors.InternalServerError(err));
        }
    }
}

new ExplorationsRoutes();

export default router;
