import { IUser } from "@/types/user";
import jwt from "jsonwebtoken";
import { generateJwtPrivateKey } from "./generate-key";
import { Session } from "next-auth";
import { auth } from "@/auth";

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

export const getSession = async () => {
  return await auth();
}

export const getIsAdmin = async () => {
  const session = await getSession();

  if (session && session.user && session.user.role == 'admin')
    return true;
  
  return false;
}