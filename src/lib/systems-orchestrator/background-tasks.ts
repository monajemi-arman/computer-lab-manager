import z from "zod";
import { sleep, waitFor } from "../utils";
import { Operation } from "./operation";
import path from "path";
import fs from 'fs/promises';
import { v4 } from 'uuid';

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
    static portToTaskId: Map<number, string>;
    static loadFails = 0;
    private dbFilePath: string;

    private toDoTasks: Task[] = [];
    private runningTasks: Task[] = [];
    private completedTasks: Task[] = [];
    private repeatingTasks: Task[] = [];

    private taskHandlers: { [key: string]: (task: Task) => Promise<Task> } = {
        "portMapHandler": this.portMapHandler.bind(this),
    };

    private constructor() {
        this.dbFilePath = path.join(__dirname, 'tasks-db.json');
    }

    static getInstance(): BackgroundTasks {
        if (!BackgroundTasks.#instance) {
            BackgroundTasks.#instance = new BackgroundTasks();
        }

        BackgroundTasks.#instance.startTasks().catch(console.error);

        return BackgroundTasks.#instance;
    }

    get #data() {
        return {
            toDoTasks: this.toDoTasks,
            runningTasks: this.runningTasks,
            completedTasks: this.completedTasks,
            repeatingTasks: this.repeatingTasks
        }
    }

    set #data({ toDoTasks, runningTasks, completedTasks, repeatingTasks }) {
        if (toDoTasks !== undefined) this.toDoTasks = toDoTasks;
        if (runningTasks !== undefined) this.runningTasks = runningTasks;
        if (completedTasks !== undefined) this.completedTasks = completedTasks;
        if (repeatingTasks !== undefined) this.repeatingTasks = repeatingTasks;
    }

    async #save(): Promise<void> {
        await fs.writeFile(this.dbFilePath, JSON.stringify(this.#data));
    }

    async #load(): Promise<void> {
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
    }

    addTask(task: Omit<Task, 'id'>) {
        this.toDoTasks.push({...task, id: v4()});
    }

    cleanupCompletedTasks() {
        this.completedTasks = this.completedTasks.slice(-20);
    }

    async startTasks() {
        while (true) {
            await this.#load;
            this.cleanupCompletedTasks();
            await waitFor(() => this.toDoTasks.length > 0);
            const task = this.toDoTasks.shift()!;
            this.runningTasks.push(task);

            // Execute the task
            if (task.handler in this.taskHandlers) {
                this.taskHandlers[task.handler](task).then((t) => {
                    this.completedTasks.push(t);
                }
                ).catch((err) => {
                    console.error(`Error executing task ${task.id}:`, err);
                    task.status = "fail";
                    this.completedTasks.push(task);
                })
            } else {
                console.error(`No handler found for task: ${task.handler}`);
            }
            await this.#save();
            await sleep(5);
        }
    }

    async repeatTaskLater(task: Task, delay: number) {
        this.repeatingTasks.push(task);
        await sleep(delay);

        if (task.id in this.repeatingTasks.map((t) => t.id)) {
            this.repeatingTasks = this.repeatingTasks.filter(t => t.id !== task.id);
            this.toDoTasks.push(task);
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
            this.repeatingTasks.filter((t) => t.id !== foundTaskId);
        }

        return task;
    }
}

export const backgroundTasks = BackgroundTasks.getInstance();