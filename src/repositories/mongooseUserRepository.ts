import { Model } from "mongoose";
import { IUserRepository } from "./userRepository";
import { IUserDocument, IUser } from "@/types/user";

export class MongooseUserRepository implements IUserRepository {
    private model: Model<IUserDocument>;

    constructor (model: Model<IUserDocument>) {
        this.model = model;
    }

    async findById(id: string): Promise<IUserDocument | null> {
        return await this.model.findById(id).exec();
    }

    async findByUsername(username: string): Promise<IUserDocument | null> {
        return await this.model.findOne({ username }).exec();
    }

    async findAll(): Promise<IUserDocument[]> {
        return await this.model.find().exec();
    }

    async create(user: IUser): Promise<IUserDocument> {
        const newUser = new this.model(user);
        return await newUser.save();
    }

    async update(id: string, user: IUser): Promise<IUserDocument | null> {
        return await this.model.findByIdAndUpdate(id, user, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        await this.model.findByIdAndDelete(id).exec();
        return true;
    }
}