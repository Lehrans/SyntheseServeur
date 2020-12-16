import express from "express";
import expressJWT from "express-jwt";
import httpErrors from "http-errors";

import explorationServices from "../services/explorationServices.js";
import explorerServices from "../services/explorerServices.js";
import monsterServices from "../services/monsterServices.js";

const router = express.Router();

//JWT middleware
const authenticateJWT = expressJWT({ secret: process.env.JWT_TOKEN_SECRET, algorithms: ['HS256'] });

//Refresh JWT middleware
const authenticateRefreshJWT = expressJWT({ secret: process.env.JWT_REFRESH_SECRET, algorithms: ['HS256'] });


class ExplorationsRoutes {
  constructor() {
    router.post("/", authenticateJWT, this.postExploration); //Ajout d'une exploration
    // Routes restantes / à faire
    router.get("/exploration/:idExploration", this.getOneExploration); //Ajout d'une exploration
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
    // Réponse hardcodé
    exploration = {
      explorationDate: "2020-11-14T02:45:49.083Z",
      destination: "StarNation",
      vault: {
        inox: 39,
        elements: [
          {
            element: "Sm",
            quantity: 4,
          },
          {
            element: "Ja",
            quantity: 9,
          },
          {
            element: "K",
            quantity: 2,
          },
          {
            element: "A",
            quantity: 5,
          },
        ],
      },
      monster: {
        talents: ["darkness", "life"],
        kernel: ["Ve", "Ex", "A", "A", "B"],
        atlasNumber: 1,
        name: "HELLO",
        health: 20,
        damage: 8,
        speed: 2,
        critical: 0.15,
        afinity: "earth",
        assets: "https://assets.andromia.science/monsters/1.png",
        hash:
          "ad6fa39869a926d58da7b377f8954b5c87f83f324287db78db42c1e806386010",
        href: null,
      },
    };
    return res.status(200).json(exploration);
  }
}

new ExplorationsRoutes();

export default router;
