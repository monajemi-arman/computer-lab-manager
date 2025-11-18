import { IFileDocument, IFileInput } from "@/types/file";
import { Model } from "mongoose";
import { IFileRepository } from "../file-repository";

export class MongooseFileRepository implements IFileRepository {
    private model: Model<IFileDocument>;

    constructor(model: Model<IFileDocument>) {
        this.model = model;
    }

    async create(file: IFileInput) {
        const newFile = new this.model(file);
        return await newFile.save();
    }

    async findByFilename(filename: string) {
        return await this.model.findOne({ filename }).exec();
    }

    async deleteByFilename(filename: string) {
        try {
            await this.model.deleteOne({ filename }).exec();
            return true;
        } catch (error) {
            return false;
        }
    }

    async deleteById(id: string) {
        try {
            await this.model.findByIdAndDelete(id).exec();
            return true;
        } catch (error) {
            return false;
        }
    }
}