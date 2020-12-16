import express from "express";
import expressJWT from "express-jwt";
import httpErrors from "http-errors";

import explorationServices from "../services/explorationServices.js";
import explorerServices from "../services/explorerServices.js";
import monsterServices from "../services/monsterServices.js";

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });


class ExplorationsRoutes {
  constructor() {
    router.post("/", authenticateJWT, this.postExploration); //Ajout d'une exploration
    router.get("/:idExploration", authenticateJWT, this.getOneExploration); //Ajout d'une exploration
  }

  //##################################################################################
  async postExploration(req, res, next) {
    try {
      console.log(req.user.username)          ;
      let exploration = {};
      if (req.query.monster === "false" && req.query.vault === "false") {
        //Aucun monstre et rien dans la vault
        req.body.explorer = await explorerServices.retrieveId(req.user.username);
        exploration = await explorationServices.create(req.body);
        exploration = exploration.toObject({ getters: false, virtuals: false });
        exploration = explorationServices.transform(exploration);
      } else if (req.query.monster === "true" && req.query.vault === "false") {
        //Un monstre et rien dans la vault
        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);
        let monster = await monsterServices.create(
          req.body.monster,
          req.body.explorer,
          exploration._id
        );

        monster = monster.toObject({ getters: false, virtuals: false });
        monster = monsterServices.transform(monster);

        exploration = exploration.toObject({ getters: false, virtuals: false });
        exploration.monster = monster;
        exploration = explorationServices.transform(exploration);
      } else if (req.query.monster === "false" && req.query.vault === "true") {
        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);
        exploration = exploration.toObject({ getters: false, virtuals: false });
        exploration = explorationServices.transform(exploration);
      } else if (req.query.monster === "true" && req.query.vault === "true") {
        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);
        let monster = await monsterServices.create(
          req.body.monster,
          req.body.explorer,
          exploration._id
        );

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
  //##################################################################################
  async getOneExploration(req, res, next) {
    try {
        let exploration = await explorationServices.retrieveById(req.params.idExploration);
        exploration = exploration.toObject({ getter: false, virtuals: false });
        exploration = explorationServices.transform(exploration);
        res.status(200).json(exploration);
   } catch(err) {
       return next(httpErrors.InternalServerError(err));
   }
  }
}

new ExplorationsRoutes();

export default router;
