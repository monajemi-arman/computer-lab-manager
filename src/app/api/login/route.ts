import { container } from "@/lib/container";
import { IUserRepository } from "@/repositories/user-repository";
import { responseJson } from "@/lib/utils";
import { LoginCredentials } from "@/types/user";
import { loginCredentialsSchema } from "@/lib/validation/userSchema";
import { connectToDatabase } from "@/lib/mongodb";
import { comparePassword } from "@/lib/password/hash";

export const POST = async (req: Request) => {
    await connectToDatabase();

    if (req.method === "POST") {
        const loginCredentials: LoginCredentials = loginCredentialsSchema.parse(await req.json());

        if (!loginCredentials.username || !loginCredentials.password) {
            return responseJson("Missing username or password!", 401);
        }

        const userRepository = container.resolve<IUserRepository>("IUserRepository");
        const user = userRepository ? await userRepository.findByUsername(loginCredentials.username) : null;

        if (!user || !user.password || !await comparePassword(loginCredentials.password, user.password)) {
            return responseJson("Invalid username or password", 401);
        }

        user.password = '';

        return responseJson(user);
    }

    return responseJson("Method not allowed!", 405);
}