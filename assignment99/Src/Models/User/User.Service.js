import UserModel from "../../DB/DB.Models/Users.model.js";
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
import { getSignature } from "../../Commeon/Security/token.js";

export async function GetUserById(headersData) {
  // console.log(headersData);

  const { authorization } = headersData;

  const deCoded = jwt.decode(authorization); //extreact from token
  console.log({ deCoded });
  const [userRole, TokenType] = deCoded.aud;
  console.log(userRole);

  console.log(TokenType);

  if (TokenType != tokenEnum.access) {
    return badRequestExeption("invaild token type");
  }
  let signiture = "";
  switch (userRole) {
    case User_Roll.User:
      signiture = USER_TOKEN_SIGNITURE;
      break;
    case User_Roll.Admin:
      signiture = ADMIN_TOKEN_SIGNITURE;
      break;
  }
  const varifyToken = jwt.verify(authorization, signiture);

  const user = await dbRepo.findById({ model: UserModel, id: varifyToken.sub });

  if (!user) {
    return unAuthorizedExeption("user not found , signUp ");
  }
  return user;

  //   const User = await dbRepo.findById({ model: UserModel, id: userId });
  //   return User;
}

//decoded
//get user data
//get user role
//check token type - must be refresh
//return new access token
export async function renewToken(headersData) {
  const { authorization } = headersData;
  const decodedToken = jwt.decode(authorization);

  const [userRole, TokenType] = decodedToken.aud;

  if (TokenType != tokenEnum.refresh) {
    return da == badRequestExeption("invalid refresh token ");
  }

  const { refreshSignature, AccessSignature } = getSignature(userRole);

  const verifiedToken = jwt.verify(authorization, refreshSignature);

  const newAccessToken = jwt.sign({}, AccessSignature, {
    expiresIn: 60 * 15,
    notBefore: 1,
    audience: [userRole, tokenEnum.access],
    subject: verifiedToken.Sub,
  });

  return newAccessToken;
}
