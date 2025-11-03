import { IComputer, IComputerInput } from "@/types/computer";

export interface IComputerRepository {
  findById(id: string): Promise<IComputer | null>;
  findByHostname(hostname: string): Promise<IComputer | null>;
  findAll(): Promise<IComputer[]>;
  create(Computer: IComputerInput): Promise<IComputer>;
  update(id: string, Computer: Partial<IComputerInput>): Promise<IComputer | null>;
  delete(id: string): Promise<boolean>;
}