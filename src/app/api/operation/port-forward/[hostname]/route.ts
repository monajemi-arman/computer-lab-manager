import { getIsAdmin, getSession } from "@/app/actions";
import { container } from "@/lib/container";
import { backgroundTasks } from "@/lib/systems-orchestrator/background-tasks";
import { responseJson } from "@/lib/utils";
import { portForwardSchema } from "@/lib/validation/port-forward";
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
    
    // Check if user has permission to computer
    const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");
    if (!computerRepository) return responseJson('computer repository not available', 500);
    if (!isAdmin && !await computerRepository?.hasAccessToComputer(username, hostname))
        return responseJson('unauthorized', 403);
    
    const body = await req.json();
    const parsedBody = portForwardSchema.parse(body);
    const { localPort, remotePort, reverse } = parsedBody;
    if (!localPort || !remotePort) responseJson("missing ports", 400);

    backgroundTasks.addTask({
        handler: 'portMapHandler',
        arguments: [hostname, remotePort, localPort],
        reverse: reverse ?? false
    });

    return responseJson('success', 200);
}