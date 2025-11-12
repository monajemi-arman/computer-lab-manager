import {IComputerDocument, IComputerInput } from "@/types/computer";

export interface IComputerRepository {
  findById(id: string): Promise<IComputerDocument | null>;
  findByHostname(hostname: string): Promise<IComputerDocument | null>;
  findAll(): Promise<IComputerDocument[]>;
  create(Computer: IComputerInput): Promise<IComputerDocument>;
  update(id: string, Computer: Partial<IComputerInput>): Promise<IComputerDocument | null>;
  delete(id: string): Promise<boolean>;
}