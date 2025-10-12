import { User } from "./user";

export interface Computer {
  id: string;
  address: string;
  hostname: string;
  status: 'active' | 'inactive';
  users: User[];
}

export interface IComputerDocument extends Document, Computer {}