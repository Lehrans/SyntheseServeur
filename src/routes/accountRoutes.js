import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import accountServices from '../services/accountServices.js';

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });

class AccountsRoutes {
    constructor() {
        router.post('/', this.post);
        router.post('/login', this.login);
        router.post('/refresh', authenticateRefreshJWT, this.refreshToken); //Pas une route secure, le token est expiré
        router.get('/secure', authenticateJWT, this.secure);
        router.delete('/logout', authenticateJWT, this.logout);
    }

    async post(req, res, next) {
        try {
            let account = await accountServices.create(req.body);
            //Generate Access Token (JWT)
            const { accessToken } = accountServices.generateJWT(account);

            account = account.toObject({ getters: false, virtuals: false });
            account = accountServices.transform(account);
            account.accessToken = accessToken;

            res.status(201).json(account);
        } catch (err) {
            return next(httpErrors.InternalServerError(err));
        }
    }

    secure(req, res, next) {
        //Retrieve user from request
        const email = req.user.email;
        return res.status(200).json(email);

        //Authorization BEARER <token>
    }

    async login(req, res, next) {
        const { username, password } = req.body;

        const result = await accountServices.login(username, password);

        if (result.account) {
            //Generate Access Token (JWT) and response
            const token = accountServices.generateJWT(result.account);
            res.status(201).json(token);
        } else {
            return next(result.err);
        }
    }

    async refreshToken(req, res, next) {
        //TODO: Retrieve account
        //1. est-ce que le refresh est dans la BD et au bon user
        const refreshToken = req.headers.authorization.split(' ')[1];
        const { email } = req.body;
        const account = await accountServices.validateRefreshToken(email, refreshToken);
        //Authorization BEARER <token>
        if (account) {
            const { accessToken } = accountServices.generateJWT(account, false);
            res.status(201).json({ accessToken });
        } else {
            await accountServices.logoutRefresh(refreshToken);
            return next(httpErrors.Unauthorized('Cannot refresh token'));
        }
    }

    async logout(req, res, next) {
        try {
            await accountServices.logout(req.user.email);
            res.status(204).end();
        } catch (err) {
            return next(httpErrors.InternalServerError());
        }
    }
}

new AccountsRoutes();

export default router;
