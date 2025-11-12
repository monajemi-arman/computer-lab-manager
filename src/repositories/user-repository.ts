import { IUserDocument, IUserInput } from "@/types/user";

export interface IUserRepository {
  findById(id: string): Promise<IUserDocument | null>;
  findByUsername(username: string): Promise<IUserDocument | null>;
  findAll(): Promise<IUserDocument[]>;
  create(user: IUserInput): Promise<IUserDocument>;
  update(id: string, user: Partial<IUserInput>): Promise<IUserDocument | null>;
  delete(id: string): Promise<boolean>;
}