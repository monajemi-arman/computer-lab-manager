import { Model } from "mongoose";
import { IComputerRepository } from "./computerRepository";
import { IComputerDocument, Computer } from "@/types/computer";

export class MongooseComputerRepository implements IComputerRepository {
    private model: Model<IComputerDocument>;

    constructor (model: Model<IComputerDocument>) {
        this.model = model;
    }

    async findById(id: string): Promise<IComputerDocument | null> {
        return await this.model.findById(id).exec();
    }

    async findByHost(hostname: string): Promise<IComputerDocument | null> {
        return await this.model.findOne({ hostname }).exec();
    }

    async findAll(): Promise<IComputerDocument[]> {
        return await this.model.find().exec();
    }

    async create(computer: Computer): Promise<IComputerDocument> {
        const newComputer = new this.model(computer);
        return await newComputer.save();
    }

    async update(id: string, computer: Computer): Promise<IComputerDocument | null> {
        return await this.model.findByIdAndUpdate(id, computer, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        await this.model.findByIdAndDelete(id).exec();
        return true;
    }
}