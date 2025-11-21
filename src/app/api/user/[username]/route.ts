import { container } from "@/lib/container";
import { minioClientWrapper } from "@/lib/minio";
import { connectToDatabase } from "@/lib/mongodb";
import { passwordToHash } from "@/lib/password/hash";
import { responseJson, sanitizeUserOutput } from "@/lib/utils";
import { updateUserSchema } from "@/lib/validation/userSchema";
import { IFileRepository } from "@/repositories/file-repository";
import { IUserRepository } from "@/repositories/user-repository";
import { NextRequest } from "next/server";

const userRepository = container.resolve<IUserRepository>("IUserRepository");

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    await connectToDatabase();

    if (!username)
        return responseJson("no username given", 404);

    const user = userRepository ? await userRepository.findByUsername(username) : null;
    if (user) user.password = '';

    if (!user)
        return responseJson("user not found", 404);

    return responseJson(sanitizeUserOutput(user.toObject()));
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    await connectToDatabase();

    if (!username)
        return responseJson("no username given", 404);

    const user = updateUserSchema.parse(await req.json());

    if (user.password && user.password.length > 0) {
        user.password = await passwordToHash(user.password);
    }

    const foundUser = userRepository ? await userRepository.findByUsername(username) : null;;

    if (!foundUser || !foundUser.id)
        return responseJson('not found', 404);

    const result = await userRepository?.update(foundUser.id, user)
    if (result) return responseJson(sanitizeUserOutput(result.toObject()));
    return responseJson({});
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    await connectToDatabase();

    if (!username)
        return responseJson("no username given", 404);

    const foundUser = userRepository ? await userRepository.findByUsername(username) : null;

    if (!foundUser || !foundUser.id)
        return responseJson('not found', 404);

    await userRepository?.delete(foundUser.id);

    const fileRepository = container.resolve<IFileRepository>("IFileRepository");
    if (!fileRepository) return responseJson('file repository not available, user files not deleted', 500);

    const userFiles = await fileRepository.findByOwner(username);
    if (userFiles && userFiles.length > 0) {
        const minioClient = await minioClientWrapper.getClient();
        for (const file of userFiles) {
            await minioClient.removeObject(minioClientWrapper.bucket, file.filename);
        }
    }
    await fileRepository.deleteByOwner(username);
    
    return responseJson({});
}