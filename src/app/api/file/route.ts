import { getSession } from '@/app/actions';
import { container } from '@/lib/container';
import { minioClientWrapper } from '@/lib/minio';
import { connectToDatabase } from '@/lib/mongodb';
import { responseJson } from '@/lib/utils';
import { IFileRepository } from '@/repositories/file-repository';
import { FileAccess } from '@/types/file';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const session = await getSession();
    const username = session?.user.username;
    const minioClient = await minioClientWrapper.getClient();

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const access: FileAccess = (formData.get('access') === 'private') ? 'private' : 'public';

        if (!file) return responseJson('no file provided', 400);

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `/${username}/${file.name}`;

        await minioClient.putObject(minioClientWrapper.bucket, fileName, buffer);

        await connectToDatabase();
        const fileRepository = container.resolve<IFileRepository>("IFileRepository");
        if (!fileRepository) return responseJson("failed file repository load", 500);

        await fileRepository?.create({
            filename: fileName,
            access,
            owner: username,
            size: file.size,
        });

        return NextResponse.json({
            success: true,
            fileName,
        });
    } catch (error) {
        return responseJson('upload failed: ' + error, 500);
    }
}