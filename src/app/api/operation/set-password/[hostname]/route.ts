import { getIsAdmin, getSession } from "@/app/actions";
import { Operation } from "@/lib/systems-orchestrator/operation";
import { responseJson } from "@/lib/utils";
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
    
    
    const body = await req.json();
    const { username: sshUsername, password } = body;
    if (!sshUsername || !password)
        return new Response("missing username or password", { status: 400 });
    if (!isAdmin && username !== sshUsername) return new Response("forbidden", { status: 403 });

    const op = new Operation(hostname);
    const result = await op.setUserPassword(sshUsername, password);
    return responseJson({ success: result });
}