import { getIsAdmin, getSession } from "@/app/actions";
import { container } from "@/lib/container";
import { Operation } from "@/lib/systems-orchestrator/operation";
import { responseJson } from "@/lib/utils";
import { IComputerRepository } from "@/repositories/computer-repository";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ hostname: string }> }
) {
    const { hostname } = await params;
    if (!hostname) return responseJson("hostname parameter is required", 400);

    const session = await getSession();
    const isAdmin = await getIsAdmin();
    const username = session?.user.username || null;
    if (!username) return new Response("unauthorized", { status: 401 });

    const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");
    if (!computerRepository) return responseJson("computer repository not available", 500);

    const authorized = isAdmin || await computerRepository.hasAccessToComputer(username, hostname);
    
    const body = await req.json();
    const { username: sshUsername } = body;
    if (!sshUsername) return new Response("missing username", { status: 400 });
    if (!authorized && username !== sshUsername) return new Response("forbidden", { status: 403 });

    const op = new Operation(hostname);
    const result = await op.addUser(sshUsername );
    return responseJson({ success: result });
}