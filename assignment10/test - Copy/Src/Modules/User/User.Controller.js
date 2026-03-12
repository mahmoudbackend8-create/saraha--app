import express from "express";
import { successResponse } from "../../Commeon/Response/Response.js";
import {
  coverProfilePic,
  getAnotherProfile,
  renewToken,
  uploadProfilePic,
} from "./User.Service.js";
import { authentication } from "../../MiddleWare/authentication.MiddleWare.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import { authorization } from "../../MiddleWare/authorization.MiddleWare.js";
import { User_Roll } from "../../Commeon/Enums/User.Enums.js";
import {
  allowFileFormats,
  localUpload,
} from "../../Commeon/Multer/Multer.Config.js";
import { validation } from "../../MiddleWare/validation.MiddleWare.js";
import { coverPicSchema, getAnotherUserProfileSchema, profilePicSchema } from "./User.Validation.js";
const UserRouter = express.Router();
UserRouter.get(
  "/GetUserById",
  authentication(),
  authorization([User_Roll.Admin]),
  async (req, res) => {
    return successResponse({ res, statusCode: 200, data: req.user });
  },
);
UserRouter.post(
  "/renewToken",
  authentication(tokenEnum.refresh),

  async (req, res) => {
    const result = await renewToken(req.user);
    return successResponse({ res, statusCode: 200, data: result });
  },
);

UserRouter.post(
  "/upload_mainPic",
  authentication(),
  localUpload({
    folderName: "Users",
    allowedFormates: allowFileFormats.img,
    fileSize: 1,
  }).single("ProfilePic"),
  validation(profilePicSchema),
  async (req, res) => {
    console.log(req.file);
    const result = await uploadProfilePic(req.user._id, req.file);
    return successResponse({ res, statusCode: 200, data: result });
  },
);

UserRouter.post(
  "/upload_coverPic",
  authentication(),
  localUpload({
    folderName: "Users",
    allowedFormates: allowFileFormats.img,
    fileSize: 1,
  }).array("coverPic", 2),
  validation(coverPicSchema),
  async (req, res) => {
    console.log(req.file);
    const result = await coverProfilePic(req.user._id, req.files);
    return successResponse({ res, statusCode: 200, data: result });
  },
);

UserRouter.get("/getAnotherProfile/:profileId", validation(getAnotherUserProfileSchema),async (req, res) => {
  const result = await getAnotherProfile(req.params.profileId);
  return successResponse({ res, data: result, statusCode: 200 });
});
export default UserRouter;
