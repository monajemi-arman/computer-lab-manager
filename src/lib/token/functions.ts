import { IUser } from "@/types/user";
import jwt from "jsonwebtoken";
import { generateJwtPrivateKey } from "./generate-key";

export const userToToken = (user: IUser) => {
  user.password = '';
  jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role
  },
    generateJwtPrivateKey.key,
    { expiresIn: 3600 }
  )
}

export const verifyToken = (token: string) => {
  return !!jwt.verify(token, generateJwtPrivateKey.key);
}