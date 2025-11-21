import { IFileDocument, IFileInput } from "@/types/file";

export interface IFileRepository {
    create(file: IFileInput): Promise<IFileDocument>,
    findByFilename(filename: string): Promise<IFileDocument | null>,
    findByOwner(owner: string): Promise<IFileDocument[]>,
    deleteByFilename(filename: string): Promise<boolean>,
    deleteById(id: string): Promise<boolean>
}