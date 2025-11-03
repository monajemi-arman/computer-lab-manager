import { HydratedDocument } from "mongoose";
import { IUser } from "./user";

export interface IComputer {
  id?: string;
  address: string;
  hostname: string;
  status: 'active' | 'inactive';
  users?: IUser[];
}

export interface IComputerInput {
  id?: string;
  address: string;
  hostname: string;
  status: 'active' | 'inactive';
  users?: (string | IUser)[];
}

export type IComputerDocument = HydratedDocument<IComputer>;