import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import explorerServices from '../services/explorerServices.js';
import monsterServices from '../services/monsterServices.js';
const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });

class ExplorersRoutes {

    //##################################################################################
    constructor() {
        router.post('/creation', this.post);                                    // Création d'un compte
        router.post('/login', this.login);                                      // Connexion d'un joueur
        router.post('/refreshToken', authenticateRefreshJWT, this.refreshToken);// Pas une route secure, le token est expiré
        router.get('/monsters', authenticateJWT, this.getAllMonsters);          // Sélection de la liste de tous les monstres d'un explorateur
        router.delete('/logout', authenticateJWT, this.logout);                 // // Déconnexion d'un joueur
        // Routes restantes / à faire
        router.get('/', authenticateJWT, this.getUser);                         // Sélection d'un compte
        router.get('/elements', authenticateJWT, this.getElements)              // Sélection des éléments d'un explorateur
        router.get('/inox', authenticateJWT, this.getInox)                      // Sélection du nombre d'inox d'un explorateur
        router.get('/location', authenticateJWT, this.getLocation)              // Sélection de la location d'un explorateur
        router.get('/explorations', authenticateJWT, this.getExlporations)      // Sélection de toutes les expéditions réalisées d'un explorateur
    }

    /* Exemple d'une route sécuritaire utilisant un Token
    secure(req, res, next) {
        //Retrieve user from request
        const username = req.user.username;
        return res.status(200).json(username);

        //Authorization BEARER <token>
    } 
    */
    //##################################################################################
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

    //##################################################################################
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

    //##################################################################################
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

    //##################################################################################
    async logout(req, res, next) {
        try {
            await explorerServices.logout(req.user.username);
            res.status(204).end();
        } catch (err) {
            return next(httpErrors.InternalServerError());
        }
    }

    //##################################################################################
    async getAllMonsters(req, res, next) {
        try {
            let explorerId = await explorerServices.retrieveId(req.user.username);
            let monsters = await monsterServices.retrieveMonsters(explorerId);
            monsters = monsters.map(m => {
                return {talents : m["talents"], kernel : m["kernel"], atlasNumber : m["atlasNumber"],
                        name : m["name"], health : m["health"], damage : m["damage"], speed : m["speed"],
                        critical : m["critical"], affinity : m["affinity"], assets : m["assets"],
                        hash : m["hash"], href : `${process.env.BASE_URL}/monsters/${m._id}` };
              });
            return res.status(200).json(monsters);
        } catch (err) {
            return next(httpErrors.InternalServerError());
        }
    }
    //##################################################################################
    async getElements(req, res, next) {
        
        // Réponse hardcodé
        elements = [
            {
                element:"Sm",
                quantity:4
            },
            {
                element:"Ja",
                quantity:9
            },
            {
                element:"K",
                quantity:2
            },
            {
                element:"A",
                quantity:5
            },
        ];
        return res.status(200).json(elements);
    }
    //##################################################################################
    async getInox(req, res, next) {
        // Réponse hardcodé
        inox = {inox:100};
        return res.status(200).json(inox);
    }
    //##################################################################################
    async getLocation(req, res, next) {
        // Réponse hardcodé
        location = {location:"Location hardcodée"};
        return res.status(200).json(location);
    }
    //##################################################################################
    async getExlporations(req, res, next) {
        // Réponse hardcodé
        explorations = [];
        return res.status(200).json(explorations);
    }
}

new ExplorersRoutes();

export default router;
