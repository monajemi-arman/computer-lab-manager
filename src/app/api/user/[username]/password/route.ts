import { container } from "@/lib/container";
import { connectToDatabase } from "@/lib/mongodb";
import { comparePassword, passwordToHash } from "@/lib/password/hash";
import { responseJson } from "@/lib/utils";
import { changePasswordSchema } from "@/lib/validation/userSchema";
import { IUserRepository } from "@/repositories/user-repository";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const username = (await params).username;

    const postData = await req.json();
    const { password, currentPassword } = changePasswordSchema.parse(postData);
    if (!password || !currentPassword || currentPassword.length === 0 || password.length === 0) {
        return responseJson("password and current password are required", 400);
    }

    if (password === currentPassword) {
        return responseJson("new password must be different from current password", 400);
    }

    await connectToDatabase();

    if (!username)
        return responseJson("no username given", 404);

    const userRepository = container.resolve<IUserRepository>("IUserRepository");
    const user = userRepository ? await userRepository.findByUsername(username) : null;
    
    if (!user)
        return responseJson("user not found", 404);
    
    // Verify current password
    if (!user.password) {
        return responseJson("user has no password set", 403);
    }
    const isCurrentPasswordCorrect = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
        return responseJson("current password is incorrect", 403);
    }

    user.password = await passwordToHash(password);
    const result = await userRepository?.update(user.id, user);
    
    if (result) return responseJson("password updated successfully");
    return responseJson("failed to update password", 500);
}