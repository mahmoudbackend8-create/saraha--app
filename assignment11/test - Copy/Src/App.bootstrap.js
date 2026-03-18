import express from "express";
import * as ENV from "../Config/Config.service.js";
import { testConnection } from "./DB/Connection.js";
import AuthRouter from "./Modules/Auth/Auth.controller.js";
import { globalErrHndling } from "./Commeon/Response/Response.js";
import UserRouter from "./Modules/User/User.Controller.js";
import cors from "cors";
import path from "path";
import redisConnection, { client } from "./DB/Radis.connection.js";
let port = ENV.PORT;
async function appBootstrap() {
  await testConnection();
  await redisConnection();
  await client.set("mahmoud", "mahmoud21", {
    expiration: { type: "EX", value: 300 },
  });
  await client.persist("mahmoud"); // delete EX time
  const app = express();

  app.use(express.json(), cors());
  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use("/Auth", AuthRouter);
  app.use("/User", UserRouter);
  app.use(globalErrHndling);
  app.listen(port, () => {
    console.log(` Server is Running on Port:: ${port}`);
  });
}

export default appBootstrap;
