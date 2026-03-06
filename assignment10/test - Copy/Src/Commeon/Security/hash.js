import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../Config/Config.service.js";
export async function hashing({ PlainText, round = SALT_ROUND }) {
return  await hash(PlainText, round);
}

export async function comparing({ PlainText, hashValue }) {
 return await compare(PlainText, hashValue);
}
