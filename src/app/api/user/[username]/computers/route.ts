import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { responseJson } from "@/lib/utils";
import { IComputerRepository } from "@/repositories/computer-repository";
import { IUserRepository } from "@/repositories/user-repository";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;
    if (!username) return responseJson("no username given", 404);

    await connectToDatabase();

    const userRepository = container.resolve<IUserRepository>("IUserRepository");
    if(!userRepository) return responseJson("User repository not available!", 500);

    const user = await userRepository.findByUsername(username);
    if (!user || !user.id) return responseJson("User not found", 404);

    const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");
    if (!computerRepository) return responseJson("Computer repository not available!", 500);

    const computers = await computerRepository.findByUserId(user.id);
    return responseJson(computers);
}