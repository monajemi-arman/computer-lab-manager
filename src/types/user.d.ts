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
}

export type IUserDocument = HydratedDocument<IUser>;

// Input shape for creating/updating a user; computers can be array of computer ids or full objects
export interface IUserInput {
  id?: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  computers?: (string | IComputer)[];
}