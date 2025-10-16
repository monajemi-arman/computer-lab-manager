import { container } from "@/lib/container";
import { IUserRepository } from "@/repositories/userRepository";
import { comparePassword, responseJson } from "@/lib/utils";
import { LoginCredentials } from "@/types/user";
import { loginCredentialsSchema } from "@/lib/validation/userSchema";
import { connectToDatabase } from "@/lib/mongodb";

export const POST = async (req: Request) => {
    await connectToDatabase();

    if (req.method === "POST") {
        const loginCredentials: LoginCredentials = loginCredentialsSchema.parse(req.body);

        if (!loginCredentials.username || !loginCredentials.password) {
            return responseJson("Missing username or password!", 401);
        }

        const userRepository = container.resolve<IUserRepository>("IUserRepository");
        const user = userRepository ? await userRepository.findByUsername(loginCredentials.username) : null;

        if (!user || !await comparePassword(loginCredentials.password, user.password)) {
            return responseJson("Invalid username or password", 401);
        }

        return responseJson({ user });
    }

    return responseJson("Method not allowed!", 405);
}