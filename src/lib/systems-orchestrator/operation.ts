import { Client } from "ssh2";
import { connectionManager } from "./connection"
import { IUser } from "@/types/user";

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
    async run(command: string) {
        const client = await this.getClient();
        if (!client) return;

        return await connectionManager.runCommandOnClient(client, command);
    }

    // Test
    async test() {
        const result = await this.run(
            "echo test"
        );

        if (!result || !result.success) throw new Error("Failed to run command.");

        if (result.output?.includes('test'))
            return true;
        else
            return false;
    }

    // Uptime
    async uptime() {
        const result = await this.run(
            "uptime -p | cut -d' ' -f2-"
        );

        return !!result?.success;
    }

    // Has username
    async hasUsername(username: string) {
        const result = await this.run(
            `grep -c '^${username}:' /etc/passwd`
        );

        if (!result || !result.success) throw new Error("Failed to check user exists.");

        if (result.output?.includes('1'))
            return true;
        else
            return false;
    }

    // Add user
    async addUser(user: IUser) {
        if (await this.hasUsername(user.username)) return true;

        let result = await this.run(
            `sudo useradd -m ${user.username}`
        );

        if (!result || !result.success || !user.publicKey) return false;

        const command = `
            export TARGET=/home/${user.username}
            mkdir -p $TARGET/.ssh &&
            chmod 700 $TARGET/.ssh &&
            printf '%s\\n' 'ssh-ed25519 ${user.publicKey}' >> $TARGET/.ssh/authorized_keys &&
            chmod 600 $TARGET/.ssh/authorized_keys
            `;
        result = await this.run(command);

        return !!result?.success;
    }

    /** Helpers **/

    async getClient() {
        return await connectionManager.hostnameToClient(this.hostname);
    }
}