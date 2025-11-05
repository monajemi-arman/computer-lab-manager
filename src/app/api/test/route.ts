import { connectionManager } from "@/lib/systems-orchestrator/connection";
import { responseJson } from "@/lib/utils";

export const GET = async () => {
    return responseJson(await connectionManager.runCommandOnHost('localhost', 'uptime'));
};