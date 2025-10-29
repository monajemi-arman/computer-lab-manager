import { HydratedDocument } from "mongoose";
import { Computer } from "./computer";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface IUser {
  id?: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  computers?: Computer[];
}

export type IUserDocument = HydratedDocument<IUser>;