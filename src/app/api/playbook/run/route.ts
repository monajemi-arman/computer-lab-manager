// curl -X POST "http://127.0.0.1:8000/jobs/run" \
// -H "Content-Type: application/json" -H "Authorization: Bearer 3ee74d6ed7017d28a1028f2d8056aad2829cb1b54d039a9eb1ee96b6c64ddfc9" \
// -d '{
//   "playbook": "playbooks/test.yml",
//   "hosts": {
//     "127.0.0.1": {}
//   }
// }'

import { ansibleAuthHeader } from "@/lib/token/functions";
import { responseJson } from "@/lib/utils";
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

    const hosts: Record<string, object> = {};
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
            playbook: "playbooks/" + input.filename,
            hosts
        })
    });

    const result: Record<'task_id', string> = await(response.json());
    
    if (response.ok) return responseJson({'id': result.task_id}, 200);
    return responseJson('failed', 500);
}