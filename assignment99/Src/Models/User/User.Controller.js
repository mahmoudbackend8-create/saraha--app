import express from "express";
import { successResponse } from "../../Commeon/Response/Response.js";
import { GetUserById, renewToken } from "./User.Service.js";
const UserRouter = express.Router();
UserRouter.get("/GetUserById/", async (req, res) => {
  const result = await GetUserById(req.headers);
  return successResponse({ res, statusCode: 200, data: result });
});
UserRouter.post("/renewToken", async (req, res) => {
  const result = await renewToken(req.headers);
  return successResponse({ res, statusCode: 200, data: result });
});
export default UserRouter;

