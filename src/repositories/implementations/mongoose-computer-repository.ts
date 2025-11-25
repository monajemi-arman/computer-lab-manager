import { Model } from "mongoose";
import { IComputerRepository } from "../computer-repository";
import { IComputerDocument, IComputerInput } from "@/types/computer";

export class MongooseComputerRepository implements IComputerRepository {
    private model: Model<IComputerDocument>;

    constructor(model: Model<IComputerDocument>) {
        this.model = model;
    }

    async findById(id: string): Promise<IComputerDocument | null> {
        return await this.model.findById(id).populate('users').exec();
    }

    async findByHostname(hostname: string): Promise<IComputerDocument | null> {
        return await this.model.findOne({ hostname }).populate('users').exec();
    }

    async findByUserId(userId: string): Promise<IComputerDocument[]> {
        return this.model.find({ users: userId }).exec();
    }

    async hasAccessToComputer(username: string, hostname: string): Promise<boolean> {
        const computer = await this.model.findOne({ hostname }).populate('users').exec();
        if (!computer || !computer.users) return false;
        const userIds = computer.users.map(user => user.username);
        return userIds.includes(username);
    }

    async findAll(): Promise<IComputerDocument[]> {
        return await this.model.find().populate('users').exec();
    }

    async create(computer: IComputerInput): Promise<IComputerDocument> {
        const newComputer = new this.model(computer);
        return await newComputer.save();
    }

    async update(id: string, computer: Partial<IComputerInput>): Promise<IComputerDocument | null> {
        return await this.model.findByIdAndUpdate(id, computer, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        await this.model.findByIdAndDelete(id).exec();
        return true;
    }
}