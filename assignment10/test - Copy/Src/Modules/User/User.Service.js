import UserModel from "../../DB/DB.Modules/Users.modul.js";
import jwt from "jsonwebtoken";
import * as dbRepo from "../../DB/DB.Repository.js";
import {
  ADMIN_TOKEN_SIGNITURE,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { User_Roll } from "../../Commeon/Enums/User.Enums.js";
import {
  badRequestExeption,
  unAuthorizedExeption,
} from "../../Commeon/Response/Response.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import {
  decodeToken,
  generateToken,
  getSignature,
  verifyToken,
} from "../../Commeon/Security/token.js";
import { decreyption } from "../../Commeon/Security/encrypt.js";

//decoded
//get user data
//get user role
//check token type - must be refresh
//return new access token
export async function renewToken(UserData) {
  // const { authorization } = headersData;
  // // const decodedToken = jwt.decode(authorization);
  //   const decodedToken =decodeToken({token:authorization})

  // const [userRole, TokenType] = decodedToken.aud;

  // if (TokenType != tokenEnum.refresh) {
  //   return badRequestExeption("invalid refresh token ");
  // }

  // const { refreshSignature, AccessSignature } = getSignature(userRole);

  // // const verifiedToken = jwt.verify(authorization, refreshSignature);

  // const verifiedToken =verifyToken({token:authorization,signature:refreshSignature})

  const { AccessSignature } = getSignature(UserData.Roll);
  const newAccessToken = generateToken({
    signature: AccessSignature,
    options: {
      noTimestamp: true,
      expiresIn: 60 * 15,
      notBefore: 1,
      audience: [UserData.Roll, tokenEnum.access],
      subject: UserData._id.toString(),
    },
  });

  return newAccessToken;
}

export async function uploadProfilePic(userId, file) {
  const result = await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: { ProfilePic: file.finalPath }, //ProfilePic same name in USERMODEL
  });
}

export async function coverProfilePic(userId, files) {
  const filePicsPath = files.map((file) => {
    return file.finalPath;
  });

  //or

  // const filePicsPath=[]
  // for(const file of files){
  //   filePicsPath.push(file.finalPath)
  // }

  const result = await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: { coverFilePic: filePicsPath }, //ProfilePic same name in USERMODEL
  });
}

export async function getAnotherProfile(profileId) {
  const user = await dbRepo.findById({
    model: UserModel,
    id: profileId,
    selelct:
      "-Password -Roll -confirmEmail -Providor -createdAt -updatedAt -__v",
  });

  if (user.phone) {
    user.phone = decreyption({ ciphertext: user.phone });
  }

  return user;
}
