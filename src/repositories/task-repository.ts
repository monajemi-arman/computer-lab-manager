import { TaskStatus, Task } from "@prisma/client"

export interface ITaskRepository {
    create(task: TaskCreateInput): Promise<Task>,
    findPlaybookTasks(playbookId: number): Promise<Task[]>,
    findById(id: string): Promise<Task | null>,
    updateStatus(id: string, status: TaskStatus): Promise<Task>,
    deleteById(id: string): Promise<boolean>
}