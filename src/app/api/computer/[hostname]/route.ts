import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { responseJson } from "@/lib/utils";
import { updateComputerSchema } from "@/lib/validation/computerSchema";
import { IComputerRepository } from "@/repositories/computerRepository";
import { IUserRepository } from "@/repositories/userRepository";
import { IComputerInput } from "@/types/computer";
import { NextRequest } from "next/server";

const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");
const userRepository = container.resolve<IUserRepository>("IUserRepository");

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ hostname: string }> }
) {
    const hostname = (await params).hostname;

    await connectToDatabase();

    if (!hostname)
        return responseJson("no hostname given", 404);

    const computer = computerRepository ? await computerRepository.findByHostname(hostname) : null;

    if (!computer)
        return responseJson("computer not found", 404);

    return responseJson(computer);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ hostname: string }> }
) {
    const hostname = (await params).hostname;

    await connectToDatabase();

    if (!hostname)
        return responseJson("no hostname given", 404);

    const computer = updateComputerSchema.parse(await req.json());

    const foundComputer = computerRepository ? await computerRepository.findByHostname(hostname) : null;;

    if (!foundComputer || !foundComputer.id)
        return responseJson('not found', 404);

    // Resolve computer users
    const newComputer: Partial<IComputerInput> = computer;
    newComputer.users = []
    if (computer && computer.users) {
        for (const username of computer.users) {
            const foundUser = userRepository ? await userRepository.findByUsername(username) : null;
            if (foundUser)
                newComputer.users.push(foundUser);
        }
    }

    const result = await computerRepository?.update(foundComputer.id, computer);
    return responseJson(result);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ hostname: string }> }
) {
    const hostname = (await params).hostname;

    await connectToDatabase();

    if (!hostname)
        return responseJson("no hostname given", 404);

    const foundComputer = computerRepository ? await computerRepository.findByHostname(hostname) : null;;

    if (!foundComputer || !foundComputer.id)
        return responseJson('not found', 404);

    try {
        await computerRepository?.delete(foundComputer.id);
    } catch {
        responseJson('db write failed', 500);
    }

    return responseJson('success', 200);
}