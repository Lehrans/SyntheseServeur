import express from "express";

import errors from "./utils/errors.js";
import database from "./utils/database.js";

import explorersRoutes from "./routes/explorerRoutes.js";
import explorationsRoutes from "./routes/explorationRoutes.js";

// Pour les ajouts récursifs
import cron from "node-cron";
import Explorers from "./models/explorer.js";
import cors from "cors";

database();

const app = express();

// Ajout de 5 inox à toutes les 5 minutes.
cron.schedule("*/5 * * * *", async () => {
  let explorer;
  explorer = await Explorers.find();
  const ajoutInox = 5;
  explorer.forEach(async (e) => {
    e.inox += ajoutInox;
    await Explorers.findOneAndUpdate({ _id: e._id }, e);
  });
});

// Ajout de trois éléments au hasard à toutes les heures.
cron.schedule("* */1 * * *", async () => {
  let explorer;
  console.log("?");
  explorer = await Explorers.find();
  explorer.forEach(async (e) => {
    e.elements.forEach((element) => {
        element.quantity += (Math.floor(Math.random() * 3) + 1);
    });
    await Explorers.findOneAndUpdate({ _id: e._id }, e);
  });
});

app.use(express.json());

app.use(cors());
app.use("/explorers", explorersRoutes);
app.use("/explorations", explorationsRoutes);
app.use("*", errors);
export default app;
