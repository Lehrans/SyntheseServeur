import express from "express";
import expressJWT from "express-jwt";
import httpErrors from "http-errors";

import explorationServices from "../services/explorationServices.js";
import explorerServices from "../services/explorerServices.js";
import monsterServices from "../services/monsterServices.js";
import Explorers from "../models/explorer.js";
import Monsters from "../models/monster.js";

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({
  secret: process.env.JWT_TOKEN_SECRET,
  algorithms: ["HS256"],
});

class ExplorationsRoutes {
  constructor() {
    router.post("/", authenticateJWT, this.postExploration); //Ajout d'une exploration
    router.get("/:idExploration", authenticateJWT, this.getOneExploration); //Ajout d'une exploration
  }

  //##################################################################################
  async postExploration(req, res, next) {
    try {
      let explorer = {};
      explorer = await explorerServices.retrieveExplorer(req.user.username);
      let exploration = {};
      if (req.query.monster === "false" && req.query.vault === "false") {
        //Aucun monstre et rien dans le vault
        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);
        exploration = exploration.toObject({ getters: false, virtuals: false });
        exploration = explorationServices.transform(exploration);

        //Ajout de la nouvelle location à l'explorer.
        explorer.location = exploration.destination;
        await Explorers.findOneAndUpdate({ _id: explorer._id }, explorer);
      } else if (req.query.monster === "true" && req.query.vault === "false") {
        //Un monstre et rien dans le vault
        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);

        if (
          req.body.monster.hash != undefined &&
          (await Monsters.findOne({ hash: req.body.monster.hash })) != null
        ) {
          throw 418;
        }
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

        //Ajout de la nouvelle location à l'explorer.
        explorer = explorerServices.substractElements(explorer, monster);
        explorer.location = exploration.destination;

        await Explorers.findOneAndUpdate({ _id: explorer._id }, explorer);
      } else if (req.query.monster === "false" && req.query.vault === "true") {
        //Aucun monstre et un vault
        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);
        exploration = exploration.toObject({ getters: false, virtuals: false });
        exploration = explorationServices.transform(exploration);

        //Ajout de la nouvelle location à l'explorer.
        explorer.location = exploration.destination;
        explorer.inox += exploration.vault.inox;
        await Explorers.findOneAndUpdate({ _id: explorer._id }, explorer);
      } else if (req.query.monster === "true" && req.query.vault === "true") {
        //Un monstre et un vault

        req.body.explorer = await explorerServices.retrieveId(
          req.user.username
        );
        exploration = await explorationServices.create(req.body);
        if (
          req.body.monster.hash != undefined &&
          (await Monsters.findOne({ hash: req.body.monster.hash })) != null
        ) {
          throw 418;
        }
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

        //Ajout de la nouvelle location à l'explorer.
        explorer = explorerServices.substractElements(explorer, monster);
        explorer.location = exploration.destination;
        explorer.inox += exploration.vault.inox;
        await Explorers.findOneAndUpdate({ _id: explorer._id }, explorer);
      }

      res.status(201).json(exploration);
    } catch (err) {
      if (err == 418) {
        return next(httpErrors.ImATeapot(err));
      }
      return next(httpErrors.InternalServerError(err));
    }
  }
  //##################################################################################
  async getOneExploration(req, res, next) {
    try {
      let exploration = await explorationServices.retrieveById(
        req.params.idExploration
      );
      exploration = exploration.toObject({ getter: false, virtuals: false });
      exploration = explorationServices.transform(exploration);
      res.status(200).json(exploration);
    } catch (err) {
      return next(httpErrors.InternalServerError(err));
    }
  }
}

new ExplorationsRoutes();

export default router;
