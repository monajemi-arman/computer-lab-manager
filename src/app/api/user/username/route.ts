import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { responseJson } from "@/lib/utils";
import { updateUserSchema } from "@/lib/validation/userSchema";
import { IUserRepository } from "@/repositories/userRepository";
import { NextRequest } from "next/server";

const userRepository = container.resolve<IUserRepository>("IUserRepository");

export const GET = async (req: NextRequest) => {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const username = searchParams.get('username');

    if (!username)
        return responseJson("no username given", 404);

    const user = userRepository ? await userRepository.findByUsername(username) : null;;

    if (!user)
        return responseJson("user not found", 404);

    return responseJson(user);
}

export const PUT = async (req: NextRequest) => {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const username = searchParams.get('username');

    if (!username)
        return responseJson("no username given", 404);

    const user = updateUserSchema.parse(req.body);

    const foundUser = userRepository ? await userRepository.findByUsername(username) : null;;

    if (!foundUser || !foundUser.id)
        return responseJson('not found', 404);

    const result = await userRepository?.update(foundUser.id, user)
    return responseJson(result);
}

export const DELETE = async (req: NextRequest) => {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const username = searchParams.get('username');

    if (!username)
        return responseJson("no username given", 404);

    const foundUser = userRepository ? await userRepository.findByUsername(username) : null;;

    if (!foundUser || !foundUser.id)
        return responseJson('not found', 404);

    await userRepository?.delete(foundUser.id);
}