import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { responseJson } from "@/lib/utils";
import { createUserSchema } from "@/lib/validation/userSchema";
import { IUserRepository } from "@/repositories/userRepository";

const userRepository = container.resolve<IUserRepository>("IUserRepository");

export const GET = async (req: Request) => {
    await connectToDatabase();

    try {
        const users = userRepository ? await userRepository.findAll() : null;
        return responseJson(users);
    } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const POST = async (req: Request) => {
    await connectToDatabase();

    try {
        const body = await req.json();
        const user = createUserSchema.parse(body);

        const foundUser = userRepository ? await userRepository.findByUsername(user.username) : null;

        if (!userRepository) {
            return responseJson("User repository not available!");
        }
        if (foundUser) {
            return responseJson("User with the given username already exists!");
        }

        const created = await userRepository.create(user);
        return responseJson('ok', 201);

    } catch (err: any) {    // eslint-disable-line
        const message = err?.message || "Invalid request";
        const status = err?.name === "ZodError" ? 400 : 400;
        return responseJson(message, status);
    }
};