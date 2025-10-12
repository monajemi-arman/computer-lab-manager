import { Computer } from "./computer";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  computers: Computer[];
}

export interface IUserDocument extends Document, User {}