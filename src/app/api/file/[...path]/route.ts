import { getIsAdmin, getSession } from "@/app/actions";
import { container } from "@/lib/container";
import { minioClientWrapper } from "@/lib/minio";
import { nodeToWebStream, responseJson } from "@/lib/utils";
import { IFileRepository } from "@/repositories/file-repository";
import { NextRequest } from "next/server"
import { basename } from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: Array<string> }> }) {
  try {
    const { path: path } = await params;
    const filename = '/' + path.join('/')

    const session = await getSession();
    const isAdmin = await getIsAdmin();

    const fileRepository = container.resolve<IFileRepository>("IFileRepository");
    const file = await fileRepository?.findByFilename(filename);

    // Check permission
    if (!file) return responseJson('file not found', 404);
    if (file.owner !== session?.user.name && !isAdmin) return responseJson('not authorized for that file', 401);

    const minioClient = await minioClientWrapper.getClient();
    const stream = await minioClient.getObject(minioClientWrapper.bucket, filename)
    const stat = await minioClient.statObject(minioClientWrapper.bucket, filename)

    const baseFilename = basename(filename);
    return new Response(nodeToWebStream(stream), {
      headers: {
        'Content-Type': stat.metaData['content-type'] || 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        "Content-Disposition": `attachment; filename="${baseFilename}"; filename*=UTF-8''${encodeURIComponent(baseFilename)}`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    return responseJson('file not found', 404);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: Array<string> }> }) {
  try {
    const { path: path } = await params;
    const filename = path.join('/')

    const session = await getSession();
    const isAdmin = await getIsAdmin();

    const fileRepository = container.resolve<IFileRepository>("IFileRepository");
    const file = await fileRepository?.findByFilename(filename);

    // Check permission
    if (!file) return responseJson('file not found', 404);
    if (file.owner !== session?.user.name && !isAdmin) return responseJson('not authorized for that file', 401);

    const minioClient = await minioClientWrapper.getClient();
    await minioClient.removeObject(minioClientWrapper.bucket, filename);
    return responseJson('success', 200);
  } catch (error) {
    return responseJson('file not found', 404);
  }
}