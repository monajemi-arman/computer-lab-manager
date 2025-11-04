import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { computerUsersToUsernames, responseJson } from "@/lib/utils";
import { createComputerSchema } from "@/lib/validation/computerSchema";
import { IComputerRepository } from "@/repositories/computerRepository";

const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");

export const GET = async () => {
    await connectToDatabase();

    try {
        const computers = computerRepository ? await computerRepository.findAll() : null;
        if (computers) {
            return responseJson(computers.map(computerUsersToUsernames));
        }

        return responseJson({});

    } catch {
        return new Response(JSON.stringify({ error: "Failed to fetch computers" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const POST = async (req: Request) => {
    await connectToDatabase();

    try {
        const body = await req.json();
        const computer = createComputerSchema.parse(body);

        const foundComputer = computerRepository ? await computerRepository.findByHostname(computer.hostname) : null;

        if (!computerRepository) {
            return responseJson("Computer repository not available!");
        }
        if (foundComputer) {
            return responseJson("Computer with the given hostname already exists!");
        }

        const created = await computerRepository.create(computer);
        return responseJson(computerUsersToUsernames(created), 201);

    } catch (err: any) {    // eslint-disable-line
        const message = err?.message || "Invalid request";
        const status = err?.name === "ZodError" ? 400 : 400;
        return responseJson(message, status);
    }
};