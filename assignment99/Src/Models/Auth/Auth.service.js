import { compare, hash } from "bcrypt";
import {
  conflictExeption,
  notFoundExeption,
} from "../../Commeon/Response/Response.js";
import UserModel from "../../DB/DB.Models/Users.model.js";
import * as dbRepo from "../../DB/DB.Repository.js";
import {
  ADMIN_TOKEN_SIGNITURE,
  ENCRYPTION_KEY,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  SALT_ROUND,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { comparing, hashing } from "../../Commeon/Security/hash.js";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { User_Roll } from "../../Commeon/Enums/User.Enums.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import { getSignature } from "../../Commeon/Security/token.js";

export async function signUp(bodyData) {
  const { email } = bodyData;
  const CheckEmail = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });
  if (CheckEmail) {
    return conflictExeption("Email Already Exist");
  }
  const hashPassword = await hashing({
    PlainText: bodyData.Password,
  });
  bodyData.Password = hashPassword;

  const phoneCrypted = CryptoJS.AES.encrypt(
    bodyData.phone,
    ENCRYPTION_KEY,
  ).toString();
  bodyData.phone = phoneCrypted;

  const User = await dbRepo.Create({ model: UserModel, data: bodyData });
  return User;
}
export async function LogIn(bodyData, url) {
  const { email, Password } = bodyData;
  const UserLoged = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });
  if (!UserLoged) {
    return notFoundExeption("invalid info");
  }
  const ComparePass = await comparing({
    PlainText: Password,
    hashValue: UserLoged.Password,
  });
  if (!ComparePass) {
    return notFoundExeption("invalid info");
  }
  // const bytes = CryptoJS.AES.decrypt(UserLoged.phone, ENCRYPTION_KEY);
  // const originalPhone = bytes.toString(CryptoJS.enc.Utf8);
  // UserLoged.phone = originalPhone

const{AccessSignature,refreshSignature}=getSignature(UserLoged.Roll)

  const Access_Token = jwt.sign({ Sub: UserLoged.id }, AccessSignature, {
    noTimestamp: true,
    expiresIn: 60 * 15,
    notBefore: 1,
    issuer: url, //"http//localhost/5000"
    audience: [UserLoged.Roll, tokenEnum.access],
  });
  const Refresh_Token = jwt.sign({ Sub: UserLoged.id }, refreshSignature, {
    noTimestamp: true,
    expiresIn: "1y",
    notBefore: 1,
    issuer: url, //"http//localhost/5000"
    audience: [UserLoged.Roll, tokenEnum.refresh],
  });
  // const Access_Token = jwt.sign({  }, 'shhhhh',{subject:UserLoged.id.toString(),noTimestamp:true,expiresIn:10});

  return { Access_Token, Refresh_Token };
}
/*
isLogedIn
  const Access_Token = jwt.sign({ Sub: UserLoged.id }, 'shhhhh',{noTimestamp:true,subject:"asas"});
it.s wrong - you can add sub or subject
*/
