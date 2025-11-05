import { Client } from 'ssh2';
import { connectToDatabase } from '../mongodb';
import { container } from '../container';
import { IComputerRepository } from '@/repositories/computerRepository';
import { waitFor } from '../utils';

class Connection {
    client: Client;
    ready: boolean;
    ended: boolean;
    address: string;

    constructor(address: string) {
        this.client = new Client();
        this.ready = false;
        this.ended = false;
        this.address = address;

        this.connect();
    }

    connect() {
        this.client.connect({
            host: this.address,
            port: 22,
            username: process.env.SSH_USER,
            privateKey: process.env.SSH_PRIVATE_KEY
        }).on('ready', () => {
            this.ready = true;
        }).on('close', () => {
            this.ended = true;
        }).on('end', () => {
            this.ended = true;
        })
    }
}

class ConnectionManager {
    static #instance: ConnectionManager;
    #clients: Client[] = [];
    #hostnameToConnection: Record<string, Connection> = {};

    private constructor() { }

    public static get instance(): ConnectionManager {
        return this.#instance ? this.#instance : new ConnectionManager();
    }

    async hostToAddress(hostname: string) {
        await connectToDatabase();
        const computerRepository = container.resolve<IComputerRepository>("IComputerRepository");

        const computer = computerRepository ? await computerRepository?.findByHostname(hostname) : null;
        if (!computer) return;

        return computer.address;
    }

    async hostnameToClient(hostname: string) {
        let connection;
        if (this.#hostnameToConnection.hasOwnProperty(hostname) && !this.#hostnameToConnection[hostname].ended) {
            connection = this.#hostnameToConnection[hostname];
        }
        else {
            const address = await this.hostToAddress(hostname);
            if (!address) return;

            connection = this.#hostnameToConnection[hostname] = new Connection(address);
        }

        await waitFor(() => connection.ready);
        return connection.client;
    }

    async runCommandOnHost(hostname: string, command: string) {
        const client = await this.hostnameToClient(hostname);
        if (!client) return null;

        const commandResult = new CommandResult();

        client.exec(command, (err, stream) => {
            if (err) {
                commandResult.status = CommandStatus.failed;
                return;
            }
            stream.on('data', (data: string) => {
                commandResult.outputArray.push(data.toString().trim());
            });
            stream.on("exit", (code) => {
                commandResult.returnCode = code;
                commandResult.status = CommandStatus.done
            });
        })
        
        await waitFor(() => commandResult.ended);
        return commandResult;
    }
}

class CommandResult {
    status: CommandStatus
    returnCode: number
    outputArray: string[]

    constructor() {
        this.status = CommandStatus.pending;
        this.returnCode = 0;
        this.outputArray = [];
    }

    get output() {
        if (this.outputArray.length === 0) return;
        return this.outputArray?.join('\n');
    }

    get ended() {
        if ([CommandStatus.failed, CommandStatus.done].includes(this.status))
            return true;
        else
            return false;
    }
}

export enum CommandStatus {
    failed = -1,
    pending = 0,
    running = 1,
    done = 2
}

export const connectionManager = ConnectionManager.instance;