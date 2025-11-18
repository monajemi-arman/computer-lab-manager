import type { Document, Types } from 'mongoose';

export type Access = 'public' | 'private';

export interface IFile {
	uuid: string;
	filename: string;
	access: Access;
	owner: Types.ObjectId | string;
	users?: (Types.ObjectId | string)[];
	size: number;
	createdAt?: Date;
}

export interface IFileDocument extends IFile, Document {}