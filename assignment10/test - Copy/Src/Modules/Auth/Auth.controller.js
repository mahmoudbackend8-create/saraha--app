import express from "express";
import {
  LogIn,
  logInWithGoogle,
  signUp,
  signUpWithGmail,
  signUpWithOTP,
} from "./Auth.service.js";
import { successResponse } from "../../Commeon/Response/Response.js";

import { validation } from "../../MiddleWare/validation.MiddleWare.js";
import { SignUpSchema } from "./Auth.validation.js";

const AuthRouter = express.Router();
AuthRouter.post("/SignUp", validation(SignUpSchema), async (req, res) => {
  const result = await signUp(req.body);
  return successResponse({ res, statusCode: 201, data: result });
});
AuthRouter.post("/SignUp/Gmail", async (req, res) => {
  const { status, result } = await signUpWithGmail(req.body.idToken);
  return successResponse({ res, statusCode: status, data: result });
});

export async function signUpController(req, res) {
  const result = await signUpWithOTP(req.body);
  return successResponse({ res, statusCode: 201, data: result });
}

export async function verifyOTPController(req, res) {
  const result = await verifyOTPService(req.body);
  return successResponse({ res, data: result });
}

AuthRouter.post("/signup", signUpController);
AuthRouter.post("/verify-otp", verifyOTPController);

AuthRouter.post("/LogIn", async (req, res) => {
  const result = await LogIn(req.body, `${req.protocol}://${req.host}`);

  return successResponse({ res, statusCode: 200, data: result });
});

// AuthRouter.post("/LogInWithGoogle", async (req, res) => {
//   const result = await logInWithGoogle(req.body.);
//   return successResponse({ res, statusCode: 200, data: result });
// });
export default AuthRouter;
