import { ComputerModel } from "@/models/computer";
import { UserModel } from "@/models/user";
import { IComputerRepository } from "@/repositories/computer-repository";
import { MongooseComputerRepository } from "@/repositories/implementations/mongoose-computer-repository";
import { MongooseUserRepository } from "@/repositories/implementations/mongoose-user-repository";
import { PrismaPlaybookRepository } from "@/repositories/implementations/prisma-playbook-repository";
import { PrismaTaskRepository } from "@/repositories/implementations/prisma-task-repository";
import { IPlaybookRepository } from "@/repositories/playbook-repository";
import { ITaskRepository } from "@/repositories/task-repository";
import { IUserRepository } from "@/repositories/user-repository";

export class Container {
    private instances: Map<string, any> = new Map(); // eslint-disable-line

    constructor() {
        this.register<IUserRepository>("IUserRepository", new MongooseUserRepository(UserModel));
        this.register<IComputerRepository>("IComputerRepository", new MongooseComputerRepository(ComputerModel));
        this.register<IPlaybookRepository>("IPlaybookRepository", new PrismaPlaybookRepository());
        this.register<ITaskRepository>("ITaskRepository", new PrismaTaskRepository());
    }

    public register<T>(key: string, instance: T): void {
        this.instances.set(key, instance);
    }

    public resolve<T>(key: string): T | undefined {
        return this.instances.get(key);
    }
}

export const container = new Container();