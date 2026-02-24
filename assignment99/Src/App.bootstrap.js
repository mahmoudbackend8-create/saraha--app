import express from "express";
import * as ENV from "../Config/Config.service.js";
import { testConnection } from "./DB/Connection.js";
import AuthRouter from "./Models/Auth/Auth.controller.js";
import { globalErrHndling } from "./Commeon/Response/Response.js";
import UserRouter from "./Models/User/User.Controller.js";
let port = ENV.PORT;
async function appBootstrap() {
  await testConnection();
  const app = express();
  app.use(express.json());
  app.use("/Auth", AuthRouter);
  app.use("/User", UserRouter);
  app.use(globalErrHndling)
  app.listen(port, () => {
    console.log(` Server is Running on Port:: ${port}`);
  });
}

export default appBootstrap;
