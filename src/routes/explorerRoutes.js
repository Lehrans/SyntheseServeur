import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import explorerServices from '../services/explorerServices.js';

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });

class ExplorersRoutes {
    constructor() {
        router.post('/', this.post);
        router.post('/login', this.login);
        router.post('/refresh', authenticateRefreshJWT, this.refreshToken); //Pas une route secure, le token est expiré
        router.get('/secure', authenticateJWT, this.secure);
        router.delete('/logout', authenticateJWT, this.logout);
    }

    async post(req, res, next) {
        try {
            let explorer = await explorerServices.create(req.body);
            //Generate Access Token (JWT)
            const { accessToken } = explorerServices.generateJWT(explorer);

            explorer = explorer.toObject({ getters: false, virtuals: false });
            explorer = explorerServices.transform(explorer);
            explorer.accessToken = accessToken;

            res.status(201).json(explorer);
        } catch (err) {
            return next(httpErrors.InternalServerError(err));
        }
    }

    secure(req, res, next) {
        //Retrieve user from request
        const username = req.user.username;
        return res.status(200).json(username);

        //Authorization BEARER <token>
    }

    async login(req, res, next) {
        const { username, password } = req.body;

        const result = await explorerServices.login(username, password);

        if (result.explorer) {
            //Generate Access Token (JWT) and response
            const token = explorerServices.generateJWT(result.explorer);
            res.status(201).json(token);
        } else {
            return next(result.err);
        }
    }

    async refreshToken(req, res, next) {
        //TODO: Retrieve explorer
        //1. est-ce que le refresh est dans la BD et au bon user
        const refreshToken = req.headers.authorization.split(' ')[1];
        const { username } = req.body;
        const explorer = await explorerServices.validateRefreshToken(username, refreshToken);
        //Authorization BEARER <token>
        if (explorer) {
            const { accessToken } = explorerServices.generateJWT(explorer, false);
            res.status(201).json({ accessToken });
        } else {
            await explorerServices.logoutRefresh(refreshToken);
            return next(httpErrors.Unauthorized('Cannot refresh token'));
        }
    }

    async logout(req, res, next) {
        try {
            await explorerServices.logout(req.user.username);
            res.status(204).end();
        } catch (err) {
            return next(httpErrors.InternalServerError());
        }
    }
}

new ExplorersRoutes();

export default router;
