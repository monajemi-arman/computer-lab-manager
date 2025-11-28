import z from "zod";
import { sleep, waitFor } from "../utils";
import { Operation } from "./operation";
import fs from 'fs/promises';
import { v4 } from 'uuid';

declare global {
    var __backgroundTasks: BackgroundTasks | undefined;
}

interface Task {
    id: string;
    handler: string;
    arguments: Array<unknown>;
    status?: "success" | "fail";
    result?: unknown;
    delay?: number
    reverse?: boolean;
}

class BackgroundTasks {
    static #instance: BackgroundTasks;
    static portToTaskId: Map<number, string> = new Map();
    private static loadFails = 0;
    private static loaded = false;
    private dbFilePath: string;

    private static toDoTasks: Task[] = [];
    private static runningTasks: Task[] = [];
    private static completedTasks: Task[] = [];
    private static repeatingTasks: Task[] = [];
    private oldData: string = '';

    private taskHandlers: { [key: string]: (task: Task) => Promise<Task> } = {
        "portMapHandler": this.portMapHandler.bind(this),
    };

    private constructor() {
        this.dbFilePath = './src/lib/systems-orchestrator/tasks-db.json';
    }

    static getInstance(): BackgroundTasks {
        if (!BackgroundTasks.#instance) {
            BackgroundTasks.#instance = new BackgroundTasks();
        }

        return BackgroundTasks.#instance;
    }

    get #data() {
        return {
            toDoTasks: BackgroundTasks.toDoTasks,
            runningTasks: BackgroundTasks.runningTasks,
            completedTasks: BackgroundTasks.completedTasks,
            repeatingTasks: BackgroundTasks.repeatingTasks
        }
    }

    set #data({ toDoTasks, runningTasks, completedTasks, repeatingTasks }) {
        if (toDoTasks !== undefined) BackgroundTasks.toDoTasks = toDoTasks;
        if (runningTasks !== undefined) BackgroundTasks.runningTasks = runningTasks;
        if (completedTasks !== undefined) BackgroundTasks.completedTasks = completedTasks;
        if (repeatingTasks !== undefined) BackgroundTasks.repeatingTasks = repeatingTasks;
    }

    async #save(): Promise<void> {
        await fs.writeFile(this.dbFilePath, JSON.stringify(this.#data));
    }

    async #saveIfChanged(): Promise<void> {
        if (JSON.stringify(this.oldData) !== JSON.stringify(this.#data))
            await this.#save();
        this.oldData = JSON.parse(JSON.stringify(this.#data));
    }

    async #load(): Promise<void> {
        if (BackgroundTasks.loaded) return;
        try {
            await fs.access(this.dbFilePath);

            this.#data = JSON.parse(
                await fs.readFile(this.dbFilePath, 'utf-8')
            );
        } catch (e) {
            if (BackgroundTasks.loadFails > 0) console.error(e);
            BackgroundTasks.loadFails += 1;
            await this.#save();
        }
        BackgroundTasks.loaded = true;
    }

    addTask = (task: Omit<Task, 'id'>) => {
        BackgroundTasks.toDoTasks.push({ ...task, id: v4() });
    }

    cleanupCompletedTasks() {
        BackgroundTasks.completedTasks = BackgroundTasks.completedTasks.slice(-20);
    }

    startTasks = async () => {
        await this.#load();
        this.doRepeatingTasks().catch(console.error);

        while (true) {
            await this.#saveIfChanged();
            this.cleanupCompletedTasks();
            await sleep(5);
            if (BackgroundTasks.toDoTasks.length === 0) continue;

            const task = BackgroundTasks.toDoTasks.shift()!;
            BackgroundTasks.runningTasks.push(task);

            // Execute the task
            if (task.handler in this.taskHandlers) {
                this.taskHandlers[task.handler](task).then((t) => {
                    BackgroundTasks.completedTasks.push(t);
                }
                ).catch((err) => {
                    console.error(`Error executing task ${task.id}:`, err);
                    task.status = "fail";
                    BackgroundTasks.completedTasks.push(task);
                })
            } else {
                console.error(`No handler found for task: ${task.handler}`);
            }

            BackgroundTasks.runningTasks = BackgroundTasks.runningTasks.filter((t) => t.id !== task.id);
        }
    }

    doRepeatingTasks = async () => {
        while (true) {
            if (BackgroundTasks.repeatingTasks.length !== 0) {
                const task = BackgroundTasks.repeatingTasks.shift()!;
                BackgroundTasks.toDoTasks.push(task);
            }

            await sleep(1);
        }
    }

    async portMapHandler(task: Task): Promise<Task> {
        const schema = z.tuple([z.string(), z.number(), z.number()]);
        const [hostname, remotePort, localPort] = schema.parse(task.arguments);
        if (!hostname || !remotePort || !localPort) {
            console.error('task error: missing port map handler arguments');
            return task;
        }

        const op = new Operation(hostname);

        if (!task.reverse) {
            if (!await op.isPortForwardingAlive(localPort)) {
                try {
                    task.status = 'success';
                    task.result = await op.forwardLocalPort(localPort, remotePort);
                } catch (e: unknown) {
                    console.error(e);
                    task.status = 'fail';
                    task.result = JSON.stringify(e);
                }
            }

            // Keep port alive
            BackgroundTasks.portToTaskId.set(localPort, task.id);
            BackgroundTasks.repeatingTasks.push({ ...task, delay: 300 })
            return task;
        }
        else {
            const foundTaskId = BackgroundTasks.portToTaskId.get(localPort);
            BackgroundTasks.repeatingTasks.filter((t) => t.id !== foundTaskId);
        }

        return task;
    }
}

export const backgroundTasks =
    global.__backgroundTasks || (global.__backgroundTasks = BackgroundTasks.getInstance());