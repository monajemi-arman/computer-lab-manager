import { sleep, waitFor } from "../utils";
import { Operation } from "./operation";

class BackgroundTasks {
    static #instance: BackgroundTasks;
    private toDoTasks: Task[] = [];
    private runningTasks: Task[] = [];
    private completedTasks: Task[] = [];

    private taskHandlers: { [key: string]: (task: Task) => Promise<Task> } = {
        "portMapHandler": this.portMapHandler.bind(this),
    };

    private constructor() {

    }

    static getInstance(): BackgroundTasks {
        if (!BackgroundTasks.#instance) {
            BackgroundTasks.#instance = new BackgroundTasks();
        }

        BackgroundTasks.#instance.startTasks().catch(console.error);

        return BackgroundTasks.#instance;
    }

    addTask(task: Task) {
        this.toDoTasks.push(task);
    }

    removeRunningTask(task: Task) {
        this.runningTasks = this.runningTasks.filter(t => t.id !== task.id);
    }

    cleanupCompletedTasks() {
        this.completedTasks = this.completedTasks.slice(-20);
    }

    async startTasks() {
        while (true) {
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
            await sleep(5);
        }
    }

    async repeatTaskLater(task: Task, delay: number) {
        await sleep(delay);
        this.toDoTasks.push(task);
    }

    async portMapHandler(task: Task): Promise<Task> {
        const [hostname, remotePort, localPort] = task.arguments as [string, number, number];

        const op = new Operation(hostname);

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
        this.repeatTaskLater(task, 300).catch(console.error);
        return task;
    }
}

interface Task {
    id: string;
    handler: string;
    arguments: Array<unknown>;
    status?: "success" | "fail";
    result?: unknown;
}