import { getIsAdmin, getSession } from "@/app/actions";
import { container } from "@/lib/container";
import { minioClientWrapper } from "@/lib/minio";
import { connectToDatabase } from "@/lib/mongodb";
import { nodeToWebStream, responseJson } from "@/lib/utils";
import { IFileRepository } from "@/repositories/file-repository";
import { NextRequest } from "next/server"
import { basename } from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: Array<string> }> }) {
  const { path: path } = await params;
  const session = await getSession();
  const username = session?.user.username;
  const isAdmin = await getIsAdmin();
  if (!username) return responseJson('not authenticated', 401);

  await connectToDatabase();
  const fileRepository = container.resolve<IFileRepository>("IFileRepository");
  if (!fileRepository) return responseJson('file repository not available', 500);

  if (path.length === 1) {
    // List directory
    const files = await fileRepository.findByOwner(isAdmin ? path[0] : username);
    if (!files) {
      return responseJson([], 200);
    }
    return responseJson(files);
  }

  const filename = '/' + path.join('/')
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
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: Array<string> }> }) {
  const { path: path } = await params;
  const filename = '/' + path.join('/')

  const session = await getSession();
  const isAdmin = await getIsAdmin();

  await connectToDatabase();
  const fileRepository = container.resolve<IFileRepository>("IFileRepository");
  if (!fileRepository) return responseJson('file repository not available', 500);
  const file = await fileRepository?.findByFilename(filename);

  // Check permission
  if (!file) return responseJson('file not found in database', 404);
  if (file.owner !== session?.user.name && !isAdmin) return responseJson('not authorized for that file', 401);

  const minioClient = await minioClientWrapper.getClient();
  await minioClient.removeObject(minioClientWrapper.bucket, filename);
  await fileRepository.deleteByFilename(filename);
  return responseJson('success', 200);
}