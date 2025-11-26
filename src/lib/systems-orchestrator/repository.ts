import path from "path";
import fs from "fs/promises";

class PortForwardingRepository {
    static #instance: PortForwardingRepository;
    private dbFilePath: string;
    private data: DatabaseEntry[] = [];

    private constructor() {
        this.dbFilePath = path.join(__dirname, 'port-forwarding-db.json');
    }

    static async getInstance(): Promise<PortForwardingRepository> {
        if (!PortForwardingRepository.#instance) {
            PortForwardingRepository.#instance = new PortForwardingRepository();
        }

        await PortForwardingRepository.#instance.#load();

        return PortForwardingRepository.#instance;
    }

    async add(dbEntry: DatabaseEntry) {
        this.data.push(dbEntry);
        await this.#save();
    }

    async getByOwner(owner: string): Promise<DatabaseEntry[]> {
        return this.data.filter(entry => entry.owner === owner);
    }

    async getByHostAndPort(host: string, port: number): Promise<DatabaseEntry | null> {
        return this.data.find(entry => entry.host === host && entry.port === port) || null;
    }

    async getAll(): Promise<DatabaseEntry[]> {
        return this.data;
    }

    async remove(dbEntry: DatabaseEntry) {
        this.data = this.data.filter(entry => !(entry.owner === dbEntry.owner && entry.host === dbEntry.host && entry.port === dbEntry.port));
        await this.#save();
    }

    async removeAllByOwner(owner: string) {
        this.data = this.data.filter(entry => entry.owner !== owner);
        await this.#save();
    }

    async removeByHostAndPort(host: string, port: number) {
        this.data = this.data.filter(entry => !(entry.host === host && entry.port === port));
        await this.#save();
    }

    async #save(): Promise<void> {
        await fs.writeFile(this.dbFilePath, JSON.stringify(this.data));
    }

    async #load(): Promise<void> {
        this.data = JSON.parse(
            await fs.readFile(this.dbFilePath, 'utf-8')
        ) as DatabaseEntry[];
    }
}

interface DatabaseEntry {
    owner: string;
    host: string;
    port: number;
}

export const portForwardingRepository = await PortForwardingRepository.getInstance();