import express from "express";
import { LogIn, signUp } from "./Auth.service.js";
import { successResponse } from "../../Commeon/Response/Response.js";
const AuthRouter = express.Router();
AuthRouter.post("/SignUp", async (req, res) => {
  const result = await signUp(req.body);
  return successResponse({ res, statusCode: 201, data: result });
});
AuthRouter.post("/LogIn", async (req, res) => {
  const result = await LogIn(req.body, `${req.protocol}://${req.host}`);

  return successResponse({ res, statusCode: 200, data: result });
});
export default AuthRouter;
