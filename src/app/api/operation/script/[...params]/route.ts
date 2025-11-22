import { Operation } from '@/lib/systems-orchestrator/operation';
import { getIsAdmin } from '@/app/actions';
import { responseJson } from '@/lib/utils';
import { NextRequest } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ params: string[] }> }
) {
    if (!await getIsAdmin())
        return responseJson("not authorized for action", 401);

    const [name, hostname] = (await params).params;

    if (!hostname || !name)
        return responseJson("invalid parameters", 400);

    const op = new Operation(hostname);
    const result = await op.runScript(name);
    if (!result) return responseJson("fail to run script", 500);
    if (result.returnCode !== 0) return responseJson("script returned non-zero exit code", 500);
    return responseJson(result.output ? JSON.parse(result.output) : "script executed successfully");
}