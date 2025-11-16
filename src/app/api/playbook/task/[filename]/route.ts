import { container } from "@/lib/container";
import { responseJson } from "@/lib/utils";
import { IPlaybookRepository } from "@/repositories/playbook-repository";
import { ITaskRepository } from "@/repositories/task-repository";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const filename = (await params).filename;
    
    const playbookRepository = container.resolve<IPlaybookRepository>("IPlaybookRepository");
    const taskRepository = container.resolve<ITaskRepository>("ITaskRepository");

    const playbook = await playbookRepository?.findByFilename(filename);
    if (!playbook || !playbook.id) return responseJson('playbook not found', 404);

    const tasks = await taskRepository?.findPlaybookTasks(playbook.id);
    if (!tasks) return responseJson('tasks not found', 404);

    return responseJson(tasks);
}