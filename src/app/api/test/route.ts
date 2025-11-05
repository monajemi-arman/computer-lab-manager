import { connectionManager } from "@/lib/orchestrator/connection";
import { responseJson } from "@/lib/utils";

export const GET = async () => {
    return responseJson(await connectionManager.runCommandOnHost('localhost', 'uptime'));
};