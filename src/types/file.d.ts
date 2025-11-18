import type { Document, Types } from 'mongoose';

export type FileAccess = 'public' | 'private';

export type IFileInput = Omit<IFile, createdAt>;

export interface IFile {
	filename: string;
	access: FileAccess;
	owner: string;
	users?: string[];
	size: number;
	createdAt?: Date;
}

export interface IFileDocument extends IFile, Document {}