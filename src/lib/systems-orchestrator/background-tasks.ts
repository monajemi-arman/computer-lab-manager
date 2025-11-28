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
        while (true) {
            await sleep(5);
            await this.#load();
            this.cleanupCompletedTasks();
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
            await this.#save();
        }
    }

    async repeatTaskLater(task: Task, delay: number) {
        BackgroundTasks.repeatingTasks.push(task);
        await sleep(delay);

        if (BackgroundTasks.repeatingTasks.some(t => t.id === task.id)) {
            BackgroundTasks.repeatingTasks = BackgroundTasks.repeatingTasks.filter(t => t.id !== task.id);
            BackgroundTasks.toDoTasks.push(task);
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
                    return task;
                } catch (e: unknown) {
                    console.error(e);
                    task.status = 'fail';
                    task.result = JSON.stringify(e);
                    return task;
                }
            }

            // Keep port alive
            BackgroundTasks.portToTaskId.set(localPort, task.id);
            this.repeatTaskLater(task, 300).catch(console.error);
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