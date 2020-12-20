import express from "express";
import expressJWT from "express-jwt";
import httpErrors from "http-errors";

import explorerServices from "../services/explorerServices.js";
import monsterServices from "../services/monsterServices.js";
import explorationServices from "../services/explorationServices.js";

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({
  secret: process.env.JWT_TOKEN_SECRET,
  algorithms: ["HS256"],
});

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({
  secret: process.env.JWT_REFRESH_SECRET,
  algorithms: ["HS256"],
});

class ExplorersRoutes {
  //##################################################################################
  constructor() {
    router.post("/", this.post); // Création d'un compte
    router.post("/login", this.login); // Connexion d'un joueur
    router.post("/refresh", authenticateRefreshJWT, this.refreshToken); // Pas une route secure, le token est expiré
    router.get("/", authenticateJWT, this.secure); // Récupérer une explorer complet.
    router.get("/monsters", authenticateJWT, this.getAllMonsters); // Sélection de la liste de tous les monstres d'un explorateur
    router.get("/monsters/:idMonster", this.getOneMonster); // Sélection d'un monstre
    router.get("/elements", authenticateJWT, this.getElements); // Sélection des éléments d'un explorateur
    router.get("/inox", authenticateJWT, this.getInox); // Sélection du nombre d'inox d'un explorateur
    router.get("/location", authenticateJWT, this.getLocation); // Sélection de la location d'un explorateur
    router.get("/explorations", authenticateJWT, this.getExplorations); // Sélection de toutes les expéditions réalisées d'un explorateur
    router.delete("/logout", authenticateJWT, this.logout); // Déconnexion d'un joueur
  }

  async secure(req, res, next) {
    try {
      let explorer = await explorerServices.retrieveExplorer(req.user.username);
      explorer = explorerServices.transform(explorer);
      res.status(200).json(explorer);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
  }
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
    const refreshToken = req.headers.authorization.split(" ")[1];
    const { username } = req.body;
    const explorer = await explorerServices.validateRefreshToken(
      username,
      refreshToken
    );
    //Authorization BEARER <token>
    if (explorer) {
      const { accessToken } = explorerServices.generateJWT(explorer, false);
      res.status(201).json({ accessToken });
    } else {
      await explorerServices.logoutRefresh(refreshToken);
      return next(httpErrors.Unauthorized("Cannot refresh token"));
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
      monsters = monsters.map((m) => {
        return {
          talents: m["talents"],
          kernel: m["kernel"],
          atlasNumber: m["atlasNumber"],
          name: m["name"],
          health: m["health"],
          damage: m["damage"],
          speed: m["speed"],
          critical: m["critical"],
          affinity: m["affinity"],
          assets: m["assets"],
          hash: m["hash"],
          href: `${process.env.BASE_URL}/monsters/${m._id}`,
        };
      });
      return res.status(200).json(monsters);
    } catch (err) {
      return next(httpErrors.InternalServerError());
    }
  }
  //##################################################################################
  async getElements(req, res, next) {
    // Réponse hardcodé
    try {
      let elements = await explorerServices.retrieveElements(req.user.username);
      res.status(200).json(elements);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
    S;
  }
  //##################################################################################
  async getInox(req, res, next) {
    try {
      let inox = await explorerServices.retrieveInox(req.user.username);
      res.status(200).json(inox);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
  }
  //##################################################################################
  async getLocation(req, res, next) {
    try {
      let location = await explorerServices.retrieveLocation(req.user.username);
      res.status(200).json(location);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
  }
  //##################################################################################
  async getExplorations(req, res, next) {
    try {
      let explorerId = await explorerServices.retrieveId(req.user.username);
      let explorations = await explorationServices.retrieveExplorations(
        explorerId
      );

      explorations = explorations.map((e) => {
        return {
          explorationDate: e["explorationDate"],
          destination: e["destination"],
          explorer: e["explorer"],
        };
      });

      res.status(200).json(explorations);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
  }
  //##################################################################################
  async getOneMonster(req, res, next) {
    try {
      let monster = await monsterServices.retrieveById(req.params.idMonster);
      console.log(monster);
      monster = monster.toObject({ getter: false, virtuals: false });
      monster = monsterServices.transform(monster);
      res.status(200).json(monster);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
  }
}

new ExplorersRoutes();

export default router;
