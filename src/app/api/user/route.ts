import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { generateSshKeys } from "@/lib/systems-orchestrator/utils";
import { passwordToHash } from "@/lib/password/hash";
import { responseJson, sanitizeUserOutput } from "@/lib/utils";
import { createUserSchema } from "@/lib/validation/userSchema";
import { IUserRepository } from "@/repositories/user-repository";
import { IUserInput } from "@/types/user";

const userRepository = container.resolve<IUserRepository>("IUserRepository");

export const GET = async () => {
    await connectToDatabase();

    try {
        const users = userRepository ? await userRepository.findAll() : null;
        if (users) {
            const sanitizedUsers = users.map((user) => sanitizeUserOutput(user.toObject()));
            return responseJson(sanitizedUsers);
        }
        
        return responseJson({});

    } catch {
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
        user.password = await passwordToHash(user.password);

        const foundUser = userRepository ? await userRepository.findByUsername(user.username) : null;

        if (!userRepository) {
            return responseJson("User repository not available!");
        }
        if (foundUser) {
            return responseJson("User with the given username already exists!");
        }

        // generate user keys
        const keys = await generateSshKeys();
        if (!keys) throw new Error("Failed to generate SSH keys.");
        const richUser: IUserInput = {...user, privateKey: keys.private, publicKey: keys.public};

        const created = await userRepository.create(richUser);
        return responseJson(sanitizeUserOutput(created.toObject()), 201);

    } catch (err: any) {    // eslint-disable-line
        const message = err?.message || "Invalid request";
        const status = err?.name === "ZodError" ? 400 : 400;
        return responseJson(message, status);
    }
};