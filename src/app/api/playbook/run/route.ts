// curl -X POST "http://127.0.0.1:8000/jobs/run" \
// -H "Content-Type: application/json" -H "Authorization: Bearer 3ee74d6ed7017d28a1028f2d8056aad2829cb1b54d039a9eb1ee96b6c64ddfc9" \
// -d '{
//   "playbook": "playbooks/test.yml",
//   "hosts": {
//     "127.0.0.1": {}
//   }
// }'

import { container } from "@/lib/container";
import { ansibleAuthHeader } from "@/lib/token/functions";
import { responseJson } from "@/lib/utils";
import { IPlaybookRepository } from "@/repositories/playbook-repository";
import { ITaskRepository } from "@/repositories/task-repository";
import { Task } from "@/types/playbook";
import { TaskStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import z from "zod";

const ANSIBLE_API = process.env.ANSIBLE_API ?? 'http://localhost:8000/api';

const DtoSchema = z.object({
    filename: z.string(),
    hosts: z.array(z.string())
})

export async function POST(req: NextRequest) {
    const input = DtoSchema.parse(
        await req.json()
    );
    
    const filename = input.filename;
    const hosts: Record<string, object> = {};
    if (!filename || input.hosts.length === 0) return responseJson("empty filename or hosts", 400);

    for (const hostname of input.hosts) {
        hosts[hostname] = {}
    }

    const response = await fetch(ANSIBLE_API + '/jobs/run', {
        method: 'POST',
        headers: {
            ...ansibleAuthHeader(),
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            playbook: "playbooks/" + filename,
            hosts
        })
    });

    const result = await (response.json());
    if (!result || !result['task_id']) return responseJson('failed', 500);

    const playbookRepository = container.resolve<IPlaybookRepository>("IPlaybookRepository");
    if (!playbookRepository) return responseJson("failed playbook repository", 500);

    const playbook = await playbookRepository.findByFilename(filename);
    if (!playbook || !playbook.id) return responseJson("playbook not found", 404);

    const task: Task = {
        id: result.task_id,
        status: TaskStatus.RUNNING,
        playbookId: playbook.id
    }

    const taskRepository = container.resolve<ITaskRepository>("ITaskRepository");
    if (!taskRepository) return responseJson('failed task repository', 500);

    const taskAdded = await taskRepository.create(task);
    if (taskAdded) return responseJson("success", 200);
}