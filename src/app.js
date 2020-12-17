import express from "express";

import errors from "./utils/errors.js";
import database from "./utils/database.js";

import explorersRoutes from "./routes/explorerRoutes.js";
import explorationsRoutes from "./routes/explorationRoutes.js";

// Pour les ajouts récursifs
import cron from "node-cron";
import Explorers from "./models/explorer.js";
import cors from "cors"

database();

const app = express();

cron.schedule("*/5 * * * * *", () => {
  const ajoutInox = 5;
  Explorers.findOneAndUpdate({}, { $inc: { inox: 5 } });
  console.log("wow");
  //explorers = Explorers.find();
  //explorer
});

app.use(express.json());

app.use(cors());
app.use("/explorers", explorersRoutes);
app.use("/explorations", explorationsRoutes);
app.use("*", errors);
export default app;
