interface PlaybookCreateInput {
    name: string,
    description: string,
    filename: string
}

interface TaskCreateInput {
    id: string,
    status: TaskStatus,
    playbookId: number
}
