import { Client } from "ssh2";
import { connectionManager } from "./connection"
import { IUser } from "@/types/user";
import { CommandResult, CommandStatus } from "./command";

interface OperationWithClient {
    getClient(): Promise<Client | null>;
}

// Decorator definition
function WithClient() {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (this: OperationWithClient, ...args: unknown[]) {
            const client = await this.getClient();
            if (!client) return;

            return originalMethod.apply(this, [client, ...args]);
        };

        return descriptor;
    };
}

export class Operation {
    hostname: string;

    /** Variables **/

    protected static variables: Record<string, string> = {
        systemUser: process.env.SSH_USER ?? 'computer-lab-manager'
    }

    protected static paths: Record<string, string> = {
        systemHome: "/home/" + this.variables.systemUser,
        authorizedKeys: '.ssh/authorized_keys'
    }

    constructor(hostname: string) {
        this.hostname = hostname;
    }

    /** Operations **/

    // Basic command
    @WithClient()
    async run(client: Client, command: string) {
        return await connectionManager.runCommandOnClient(client, command);
    }

    // Uptime
    @WithClient()
    async uptime(client: Client) {
        const result = await this.run(
            client, "uptime -p | cut -d' ' -f2-"
        );

        return !!result?.success;
    }

    @WithClient()
    async addUser(client: Client, user: IUser) {
        let result = await this.run(
            client, `sudo useradd -m ${user.username}`
        );

        if (!result || !result.success || !user.publicKey) return false;

        const command = `
            export TARGET=/home/${user.username}
            mkdir -p $TARGET/.ssh &&
            chmod 700 $TARGET/.ssh &&
            printf '%s\\n' 'ssh-ed25519 ${user.publicKey}' >> $TARGET/.ssh/authorized_keys &&
            chmod 600 $TARGET/.ssh/authorized_keys
            `;
        result = await this.run(client, command);

        return !!result?.success;
    }

    /** Helpers **/

    async getClient() {
        return await connectionManager.hostnameToClient(this.hostname);
    }
}
