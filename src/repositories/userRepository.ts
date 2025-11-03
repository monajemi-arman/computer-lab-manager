import { IUser, IUserInput } from "@/types/user";

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(user: IUserInput): Promise<IUser>;
  update(id: string, user: Partial<IUserInput>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}