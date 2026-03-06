import { compare, hash } from "bcrypt";
import {
  badRequestExeption,
  conflictExeption,
  notFoundExeption,
} from "../../Commeon/Response/Response.js";
import UserModel from "../../DB/DB.Modules/Users.modul.js";
import * as dbRepo from "../../DB/DB.Repository.js";
import {
  ADMIN_TOKEN_SIGNITURE,
  ENCRYPTION_KEY,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  SALT_ROUND,
  GOOGLE_CLIENT_ID,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { comparing, hashing } from "../../Commeon/Security/hash.js";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { User_Providor, User_Roll } from "../../Commeon/Enums/User.Enums.js";
import { tokenEnum } from "../../Commeon/Enums/token.Enums.js";
import { generateAccessAndRefreshToken, generateToken, getSignature } from "../../Commeon/Security/token.js";
import { OAuth2Client } from "google-auth-library";






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

  return generateAccessAndRefreshToken(UserLoged);

  // const Refresh_Token = jwt.sign({ Sub: UserLoged.id }, refreshSignature, {
  //   noTimestamp: true,
  //   expiresIn: "1y",
  //   notBefore: 1,
  //   issuer: url, //"http//localhost/5000"
  //   audience: [UserLoged.Roll, tokenEnum.refresh],
  // });
  // const Access_Token = jwt.sign({  }, 'shhhhh',{subject:UserLoged.id.toString(),noTimestamp:true,expiresIn:10});
}
/*
isLogedIn
  const Access_Token = jwt.sign({ Sub: UserLoged.id }, 'shhhhh',{noTimestamp:true,subject:"asas"});
it.s wrong - you can add sub or subject
*/

async function VarifyGoogleIdToken(idToken) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}






export async function logInWithGoogle(idToken) {
  const payLoad = await VarifyGoogleIdToken(idToken);
  if (!payLoad.email) {
    return badRequestExeption("email Must Be varified");
  }
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: {
      email: payLoad.email,
      Providor: User_Providor.Google,
    },
  });
  if (!user) {
    return signUpWithGmail(idToken);
  }

return generateAccessAndRefreshToken(user)
}









export async function signUpWithGmail(idToken) {
  const payLoadGoogleToken = await VarifyGoogleIdToken(idToken);

  if (!payLoadGoogleToken.email_verified) {
    return badRequestExeption("email must be varified");
  }
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email: payLoadGoogleToken.email },
  });

  if (user) {
    if (user.Providor == User_Providor.System) {
      return badRequestExeption(
        "email already exist - Login with your email and passward",
      );
    }
    return { status: 200, result: await logInWithGoogle(idToken) };
  }

  const AddUser = await dbRepo.Create({
    model: UserModel,
    data: {
      email: payLoadGoogleToken.email,
      UserName: payLoadGoogleToken.name,
      ProfilePic: payLoadGoogleToken.picture,
      confirmEmail: true,
      Providor: User_Providor.Google, // this will let you not have to enter password - USERMODEL FUNCTION
    },
  });
  console.log({ AddUser });

  return { result: generateAccessAndRefreshToken(AddUser), status: 201 };
}



export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 أرقام
}

export async function signUpWithOTP(userData) {
  const { email, UserName } = userData;


  const otp = generateOTP();
  const otpExpires = Date.now() + 5 * 60 * 1000; // 5 دقائق


  const newUser = await dbRepo.Create({
    model: UserModel,
    data: {
      email,
      UserName,
      OTP: otp,
      OTPExpires: otpExpires,
      confirmEmail: false,
      Providor: User_Providor.System,
    },
  });


  await sendEmail({
    to: email,
    subject: "Verify your account",
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`,
  });

  return { message: "OTP sent to email" };
}

export async function verifyOTPService({ email, otp }) {
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) throw badRequestExeption("User not found");
  if (user.OTP !== otp) throw badRequestExeption("Invalid OTP");
  if (user.OTPExpires < Date.now()) throw badRequestExeption("OTP expired");


  user.confirmEmail = true;
  user.OTP = null;
  user.OTPExpires = null;

  await user.save();

  return generateAccessAndRefreshToken(user); 
}

/*
{
    iss: 'https://accounts.google.com',
    azp: '145851293811-mfp43e9ps948dmsdjgqpmskdhlgluchh.apps.googleusercontent.com',
    aud: '145851293811-mfp43e9ps948dmsdjgqpmskdhlgluchh.apps.googleusercontent.com',
    sub: '114706696193491683546',
    email: 'mahmoudbackend8@gmail.com',
    email_verified: true,
    nbf: 1772201294,
    name: 'mahmoud_backend',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocLNhC14TsUAc2hJcNHu_0ba9gs40AYgetfvHHF51lih4_Iq5w=s96-c',
    given_name: 'mahmoud_backend',
    iat: 1772201594,
    exp: 1772205194,
    jti: '479dbee627c873d14c836e366f6db7e44a4b90f4'
  }
}
*/








