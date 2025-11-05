import { HydratedDocument } from "mongoose";
import { IComputer } from "./computer";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface IUser {
  id?: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  computers?: IComputer[];
  privateKey?: string;
  publicKey?: string;
}

export type IUserDocument = HydratedDocument<IUser>;

export interface IUserInput {
  id?: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  computers?: (string | IComputer)[];
  privateKey?: string;
  publicKey?: string;
}