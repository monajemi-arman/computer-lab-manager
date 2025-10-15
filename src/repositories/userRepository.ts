import { IUser } from "@/types/user";

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(user: IUser): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}