import joi from "joi";
import {
  User_Gender,
  User_Providor,
  User_Roll,
} from "../../Commeon/Enums/User.Enums.js";
import { CommonFieldValidation } from "../../MiddleWare/validation.MiddleWare.js";

export const SignUpSchema = {
  body: joi.object({}).keys({
    UserName: CommonFieldValidation.UserName.required(),

    email: CommonFieldValidation.email.required(),
    Password: CommonFieldValidation.Password.required(),
    DOB: CommonFieldValidation.DOB.required(),
    phone: CommonFieldValidation.phone,
    gender: CommonFieldValidation.gender,
    Roll: CommonFieldValidation.Roll.required(),
    confirmEmail: CommonFieldValidation.confirmEmail,
    Providor: CommonFieldValidation.Providor.required(),
  }),
};

export const logInschema = {
  body: joi.object({}).keys({ email: joi.string(), Password: joi.string() }),
};
