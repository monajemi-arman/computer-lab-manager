import { Model } from "mongoose";
import { IUserRepository } from "./user-repository";
import { IUserDocument, IUserInput } from "@/types/user";

export class MongooseUserRepository implements IUserRepository {
    private model: Model<IUserDocument>;

    constructor (model: Model<IUserDocument>) {
        this.model = model;
    }

    async findById(id: string): Promise<IUserDocument | null> {
        return await this.model.findById(id).populate('computers').exec();
    }

    async findByUsername(username: string): Promise<IUserDocument | null> {
        return await this.model.findOne({ username }).exec();
    }

    async findAll(): Promise<IUserDocument[]> {
        return await this.model.find().populate('computers').exec();
    }

    async create(user: IUserInput): Promise<IUserDocument> {
        const newUser = new this.model(user);
        return await newUser.save();
    }

    async update(id: string, user: Partial<IUserInput>): Promise<IUserDocument | null> {
        return await this.model.findByIdAndUpdate(id, user, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        await this.model.findByIdAndDelete(id).exec();
        return true;
    }
}