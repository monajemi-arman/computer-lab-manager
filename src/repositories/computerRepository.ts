import { Computer } from "@/types/computer";

export interface IComputerRepository {
  findById(id: string): Promise<Computer | null>;
  findByHost(hostname: string): Promise<Computer | null>;
  findAll(): Promise<Computer[]>;
  create(Computer: Computer): Promise<Computer>;
  update(id: string, Computer: Partial<Computer>): Promise<Computer | null>;
  delete(id: string): Promise<boolean>;
}