import {
  ADMIN_TOKEN_SIGNITURE,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  USER_TOKEN_SIGNITURE,
} from "../../../Config/Config.service.js";
import { User_Roll } from "../Enums/User.Enums.js";

export function getSignature(role) {
  let refreshSignature = "";
  let AccessSignature = "";
  switch (role) {
    case User_Roll.user:
      refreshSignature = REFRESH_USER_TOKEN_SIGNITURE;
      AccessSignature = USER_TOKEN_SIGNITURE;
      break;

    case User_Roll.Admin:
      refreshSignature = REFRESH_ADMIN_TOKEN_SIGNITURE;
      AccessSignature = ADMIN_TOKEN_SIGNITURE;
      break;
  }
  return { refreshSignature, AccessSignature };
}
