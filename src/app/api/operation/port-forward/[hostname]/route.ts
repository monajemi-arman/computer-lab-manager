import { getIsAdmin, getSession } from "@/app/actions";
import { container } from "@/lib/container";
import { backgroundTasks } from "@/lib/systems-orchestrator/background-tasks";
import { responseJson } from "@/lib/utils";
import { portForwardSchema } from "@/lib/validation/port-forward";
import { IComputerRepository } from "@/repositories/computer-repository";
import { IPortMapRepository } from "@/repositories/portmap-repository";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
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

    if (!isAdmin && !await computerRepository.hasAccessToComputer(username, hostname))
        return responseJson("unauthorized", 403);

    const portMapRepository = container.resolve<IPortMapRepository>("IPortMapRepository");
    if (!portMapRepository) return responseJson("fail portmap repository", 500);

    const mappings = await portMapRepository.findByHostname(hostname);

    return responseJson(mappings, 200);
}

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

    const portMapRepository = container.resolve<IPortMapRepository>("IPortMapRepository");
    if (!portMapRepository) return responseJson('fail portmap repository', 500);

    const portMap: PortMapInput = {
        owner: username,
        hostname,
        localPort,
        remotePort
    }
    await portMapRepository.create(portMap);

    backgroundTasks.addTask({
        handler: 'portMapHandler',
        arguments: [hostname, remotePort, localPort],
        reverse: reverse ?? false
    });

    return responseJson('success', 200);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ hostname: string }> }
) {
    const { hostname } = await params;
    if (!hostname) return responseJson("hostname parameter is required", 400);

    const session = await getSession();
    const isAdmin = await getIsAdmin();
    const username = session?.user.username || null;
    if (!username) return new Response("unauthorized", { status: 401 });

    // Check computer access
    const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");
    if (!computerRepository) return responseJson("computer repository not available", 500);

    if (!isAdmin && !await computerRepository.hasAccessToComputer(username, hostname))
        return responseJson("unauthorized", 403);

    const portMapRepository = container.resolve<IPortMapRepository>("IPortMapRepository");
    if (!portMapRepository) return responseJson("fail portmap repository", 500);

    const localPortParam = req.nextUrl.searchParams.get("localPort");
    if (!localPortParam) return responseJson("missing localPort", 400);

    const localPort = Number(localPortParam);
    if (Number.isNaN(localPort))
        return responseJson("invalid localPort", 400);

    // Get mapping by localPort
    const record = await portMapRepository.findByLocalPort(localPort);
    if (!record) return responseJson("not found", 404);

    if (record.hostname !== hostname)
        return responseJson("hostname mismatch", 400);

    if (!isAdmin && record.owner !== username)
        return responseJson("unauthorized", 403);

    const deleted = await portMapRepository.deleteByLocalPort(localPort);
    if (!deleted) return responseJson("delete failed", 500);

        backgroundTasks.addTask({
        handler: 'portMapHandler',
        arguments: [hostname, 1234, localPort],
        reverse: true
    });

    return responseJson("deleted", 200);
}
