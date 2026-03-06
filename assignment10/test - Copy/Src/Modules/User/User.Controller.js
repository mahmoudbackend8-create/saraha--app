import express from "express";
import { successResponse } from "../../Commeon/Response/Response.js";
import { renewToken } from "./User.Service.js";
import { authentication } from "../../MiddleWare/authentication.MiddleWare.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import { authorization } from "../../MiddleWare/authorization.MiddleWare.js";
import { User_Roll } from "../../Commeon/Enums/User.Enums.js";
const UserRouter = express.Router();
UserRouter.get("/GetUserById", authentication(),authorization([User_Roll.Admin]), async (req, res) => {
  return successResponse({ res, statusCode: 200, data: req.user });
});
UserRouter.post(
  "/renewToken",
  authentication(tokenEnum.refresh),
  
  async (req, res) => {
    const result = await renewToken(req.user);
    return successResponse({ res, statusCode: 200, data: result });
  },
);
export default UserRouter;
