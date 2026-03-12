import { tokenEnum } from "../Commeon/Enums/token.Enums.js";
import {
  badRequestExeption,
  unAuthorizedExeption,
} from "../Commeon/Response/Response.js";
import {
  decodeToken,
  getSignature,
  verifyToken,
} from "../Commeon/Security/token.js";
import UserModel from "../DB/DB.Modules/Users.modul.js";
import * as dbRepo from "../DB/DB.Repository.js";

export function authentication(tokenTypeParam = tokenEnum.access) {
  return async (req, res, next) => {
    const { authorization } = req.headers;


    const [BearerKey, token] = authorization.split(" ");
    if (BearerKey != "Bearer") {
      return badRequestExeption("Invalid BearerKey");
    }

    const deCoded = decodeToken({ token: token });
    // const deCoded = jwt.decode(authorization); //extreact from token
console.log(deCoded);

    const [userRole, TokenType] = deCoded.aud;

    if (TokenType != tokenTypeParam) {
      return badRequestExeption("invaild token type");
    }
    const { AccessSignature, refreshSignature } = getSignature(userRole);
    // let signiture = "";
    // switch (userRole) {
    //   case User_Roll.User:
    //     signiture = USER_TOKEN_SIGNITURE;
    //     break;
    //   case User_Roll.Admin:
    //     signiture = ADMIN_TOKEN_SIGNITURE;
    //     break;
    // }
    // const varifyToken = jwt.verify(authorization, signiture);
    const varifyToken = verifyToken({
      token: token,
      signature:
        tokenTypeParam == tokenEnum.access ? AccessSignature : refreshSignature,
    });

    const user = await dbRepo.findById({
      model: UserModel,
      id: varifyToken.sub,
    });

    if (!user) {
      return unAuthorizedExeption("user not found , signUp ");
    }
    req.user = user;

   

    next();

    //   const User = await dbRepo.findById({ model: UserModel, id: userId });
    //   return User;
  };
}
