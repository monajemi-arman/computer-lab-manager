import { TaskStatus } from "@prisma/client"

interface Playbook {
    id?: number
    name: string
    filename: string
    description: string
}

interface Task {
    id: string,
    status: TaskStatus,
    playbookId: number
}