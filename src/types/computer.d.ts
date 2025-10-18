import { HydratedDocument } from "mongoose";
import { IUser } from "./user";

export interface Computer {
  id: string;
  address: string;
  hostname: string;
  status: 'active' | 'inactive';
  users: IUser[];
}

export type IComputerDocument = HydratedDocument<Computer>;