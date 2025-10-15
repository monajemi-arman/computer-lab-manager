import { ComputerModel } from "@/models/computer";
import { UserModel } from "@/models/user";
import { IComputerRepository } from "@/repositories/computerRepository";
import { MongooseComputerRepository } from "@/repositories/mongooseComputerRepository";
import { MongooseUserRepository } from "@/repositories/mongooseUserRepository";
import { IUserRepository } from "@/repositories/userRepository";

export class Container {
    private instances: Map<string, any> = new Map(); // eslint-disable-line

    constructor() {
        this.register<IUserRepository>("IUserRepository", new MongooseUserRepository(UserModel));
        this.register<IComputerRepository>("IComputerRepository", new MongooseComputerRepository(ComputerModel));
    }

    public register<T>(key: string, instance: T): void {
        this.instances.set(key, instance);
    }

    public resolve<T>(key: string): T | undefined {
        return this.instances.get(key);
    }
}

export const container = new Container();