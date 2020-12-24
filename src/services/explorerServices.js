import crypto from "crypto";
import jwt from "jsonwebtoken";
import httpErrors from "http-errors";

import Explorers from "../models/explorer.js";

class ExplorerServices {
  async login(username, password) {
    const explorer = await Explorers.findOne({ username: username });

    if (!explorer) {
      return {
        err: httpErrors.Unauthorized(
          `Aucun compte existant avec le nom d'utilisateur ${username}`
        ),
      };
    } else {
      if (this.validatePassword(password, explorer)) {
        return { explorer: explorer };
      } else {
        return { err: httpErrors.Unauthorized("Erreur d'authentification") };
      }
    }
  }

  validatePassword(password, explorer) {
    //Validate de password with hash
    const iteration = parseInt(process.env.HASH_ITERATION, 10);
    const hash = crypto
      .pbkdf2Sync(password, explorer.salt, iteration, 64, "sha512")
      .toString("base64");

    return hash === explorer.hash;
  }

  create(explorer) {
    //Generate salt
    explorer.salt = crypto.randomBytes(16).toString("base64");
    //Generate hash
    const hrstart = process.hrtime();

    const iteration = parseInt(process.env.HASH_ITERATION, 10);

    explorer.hash = crypto
      .pbkdf2Sync(explorer.password, explorer.salt, iteration, 64, "sha512")
      .toString("base64");

    const hrEnd = process.hrtime(hrstart);
    console.info(
      "Execution time (iteration - %d): %ds %dms",
      iteration,
      hrEnd[0],
      hrEnd[1] / 1000000
    );

    return Explorers.create(explorer);
  }

  generateJWT(explorer, needNewRefresh = true) {
    let refreshToken = "";
    const accessToken = jwt.sign(
      { username: explorer.username },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: process.env.JWT_TOKEN_LIFE }
    ); //Generate the token

    if (needNewRefresh) {
      //Generate refreshToken
      refreshToken = jwt.sign({}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_LIFE,
      }); //Generate the token
      explorer.refreshToken = refreshToken;
      explorer.save();
      //TODO: Autre sécurité codé serveur (blacklist, maxAttempt, courriel lors d'une connexion)
    }

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(username, refreshToken) {
    return await Explorers.findOne({
      username: username,
      refreshToken: refreshToken,
    });
  }

  logout(username) {
    return Explorers.findOneAndUpdate(
      { username: username },
      { refreshToken: "" },
      { new: true }
    );
  }

  logoutRefresh(refreshToken) {
    return Explorers.findOneAndUpdate(
      { refreshToken: refreshToken },
      { refreshToken: "" },
      { new: true }
    );
  }

  transform(explorer) {
    //Do some logic cleanup
    delete explorer.salt;
    delete explorer.hash;

    delete explorer._id;
    delete explorer.__v;

    return explorer;
  }

  async retrieveId(username) {
    let explorer = await Explorers.findOne({ username: username });
    return explorer._id;
  }

  async retrieveLocation(username) {
    let explorer = await Explorers.findOne({ username: username });
    return explorer.location;
  }

  async retrieveElements(username) {
    let explorer = await Explorers.findOne({ username: username });
    return explorer.elements;
  }

  async retrieveInox(username) {
    let explorer = await Explorers.findOne({ username: username });
    return explorer.inox;
  }

  async retrieveExplorer(username) {
    let explorer = await Explorers.findOne({ username: username });
    return explorer;
  }

  async updateExplorer(id, exploration) {
    let explorerFound = await Explorers.findById(id);
    exploration.vault.elements.forEach((e) => {
      explorerFound.elements.forEach((el) => {
        if (e.element == el.element) {
          el.quantity += e.quantity;
        } else {
          var index = explorerFound.elements.findIndex(
            (x) => x.element == e.element
          );
          if (index === -1) {
            explorerFound.elements.push(e);
          }
        }
      });
    });
    explorerFound.inox += exploration.vault.inox;
    let explorer = await Explorers.findOneAndUpdate({ _id: id }, explorerFound);
    return explorer;
  }

  substractElements(explorer, monster){
    monster.kernel.forEach((k) => {
      explorer.elements.forEach((e)=>{
        if(k === e.element) e.quantity--;
      });
    });
    return explorer;
  }

}

export default new ExplorerServices();
