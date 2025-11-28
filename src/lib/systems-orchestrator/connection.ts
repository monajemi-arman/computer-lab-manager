import { Client } from 'ssh2';
import { connectToDatabase } from '../mongodb';
import { container } from '../container';
import { IComputerRepository } from '@/repositories/computer-repository';
import { waitFor } from '../utils';
import { CommandResult, CommandStatus } from './command';
import net, { Server } from 'net';

class Connection {
    client: Client;
    ready: boolean;
    ended: boolean;
    failed: boolean;
    address: string;

    constructor(address: string) {
        this.client = new Client();
        this.ready = false;
        this.ended = false;
        this.failed = false;
        this.address = address;

        this.connect();
    }

    connect() {
        try {
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
        } catch { this.failed = true; }
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
        if (this.#hostnameToConnection.hasOwnProperty(hostname) && this.#hostnameToConnection[hostname].ready) {
            connection = this.#hostnameToConnection[hostname];
        }
        else {
            const address = await this.hostToAddress(hostname);
            if (!address) return;

            connection = this.#hostnameToConnection[hostname] = new Connection(address);
        }

        await waitFor(() => connection.ready || connection.failed);

        return connection.ready ? connection.client : null;
    }

    async runCommandOnClient(client: Client, command: string) {
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

    async forwardLocalPort(
        hostname: string,
        localPort: number,
        remotePort: number
    ) {
        const remoteHost = await this.hostToAddress(hostname);
        if (!remoteHost) {
            console.error('address associated with given hostname for operation not found');
            return;
        }

        const client: Client | null | undefined = await this.hostnameToClient(hostname);
        if (!client) throw new Error(`Unable to open SSH connection for ${hostname}`);

        return new Promise<Server>((resolve, reject) => {
            const server = net.createServer((localSocket) => {
                client.forwardOut(
                    "0.0.0.0",
                    0,
                    remoteHost,
                    remotePort,
                    (err, sshStream) => {
                        if (err) {
                            console.error("forwardOut error:", err);
                            localSocket.end();
                            return;
                        }

                        localSocket.pipe(sshStream).pipe(localSocket);
                    }
                );
            });

            server.listen(localPort, "0.0.0.0", () => {
                console.log(
                    `SSH forward active for ${hostname}: local ${localPort} → ${remoteHost}:${remotePort}`
                );

                resolve(server);
            });

            server.on("error", reject);
        });
    }

    async isPortForwardAlive(localPort: number): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();

            socket.once("connect", () => {
                socket.destroy();
                resolve(true);
            });

            socket.once("error", () => {
                resolve(false);
            });

            socket.connect(localPort, "127.0.0.1");
        });
    }

}

export const connectionManager = ConnectionManager.instance;