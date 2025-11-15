import { Task } from "@/types/playbook"
import { TaskStatus } from "@prisma/client"

export interface ITaskRepository {
    create(task: Task): Promise<Task>,
    findPlaybookTasks(playbookId: number): Promise<Task[]>,
    findById(id: string): Promise<Task | null>,
    updateStatus(id: string, status: TaskStatus): Promise<Task>,
    deleteById(id: string): Promise<boolean>
}