import { connectionManager } from "./connection"
import { IUser } from "@/types/user";
import fs from "fs";
import path from "path";

export class Operation {
    public static CacheEntries: CacheEntry[] = [];
    public static MaxOperationCacheAge: Record<string, number> = {
        'storage-stats': 60 * 60 * 1000 // 1 hour
    };

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

        if (!result || !result.success) return false;

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
    async addUser(user: IUser, isAdmin: boolean = false) {
        if (await this.hasUsername(user.username)) return true;

        let result = await this.run(
            `sudo useradd -m ${user.username}` + (isAdmin ? ' -G sudo' : '')
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

    async runScript(name: string) {
        const cache = this.getCache(name);
        if (cache) return JSON.parse(cache);

        const relativePath = `${path.join('src/lib/systems-orchestrator/scripts', name)}.sh`;

        const client = await this.getClient();
        if (!client) return false;

        const localPath = path.resolve(relativePath);

        let script: string;
        try {
            script = fs.readFileSync(localPath, "utf-8");
        } catch (err) {
            throw new Error(`Failed to read script at ${localPath}: ${err}`);
        }

        const remotePath = `/tmp/script-${Date.now()}.sh`;

        const escaped = script.replace(/`/g, "\\`");

        const uploadCmd =
            `cat <<'EOF' > "${remotePath}"\n` +
            escaped +
            `\nEOF`;

        let result = await this.run(uploadCmd);
        if (!result?.success) {
            throw new Error("Failed to write script to remote machine.");
        }

        result = await this.run(`chmod +x "${remotePath}"`);
        if (!result?.success) {
            throw new Error("Failed to chmod script on remote machine.");
        }

        const execResult = await this.run(`bash "${remotePath}"`);
        await this.run(`rm -f "${remotePath}"`);

        this.setCache(name, JSON.stringify(execResult));
        return execResult;
    }


    /** Helpers **/

    async getClient() {
        return await connectionManager.hostnameToClient(this.hostname);
    }

    getOperationMaxAge(name: string) {
        return Operation.MaxOperationCacheAge[name] || 5 * 60 * 1000;
    }

    getCache(name: string) {
        const entry = Operation.CacheEntries.find(
            (e) => e.name === name && e.hostname === this.hostname
        );
        if (!entry) return null;

        const now = Date.now();
        const age = now - entry.timestamp;
        const maxAge = 60 * 60 * 1000;

        if (age > maxAge) {
            Operation.CacheEntries = Operation.CacheEntries.filter(
                (e) => !(e.name === name && e.hostname === this.hostname)
            );
            return null;
        }

        return entry.data;
    }

    setCache(name: string, data: string) {
        const now = Date.now();
        const existingIndex = Operation.CacheEntries.findIndex(
            (e) => e.name === name && e.hostname === this.hostname
        );
        if (existingIndex !== -1) {
            Operation.CacheEntries[existingIndex].data = data;
            Operation.CacheEntries[existingIndex].timestamp = now;
        } else {
            Operation.CacheEntries.push({
                name,
                hostname: this.hostname,
                data,
                timestamp: now
            });
        }
    }
}

interface CacheEntry {
    name: string;
    hostname: string;
    data: string;
    timestamp: number;
}