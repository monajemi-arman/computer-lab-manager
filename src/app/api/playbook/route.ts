import { container } from "@/lib/container";
import { ansibleAuthHeader } from "@/lib/token/functions";
import { IPlaybookRepository } from "@/repositories/playbook-repository";
import { responseJson } from "@/lib/utils";
import { NextRequest } from "next/server";
import { createPlaybookSchema } from "@/lib/validation/playbook";

const ANSIBLE_API = process.env.ANSIBLE_API ?? 'http://localhost:8000/api';

export const GET = async () => {
    const response = await fetch(ANSIBLE_API + '/playbooks', { headers: ansibleAuthHeader() });
    const playbookFilenames: string[] = (await response.json()).playbooks;
    if (!playbookFilenames) return responseJson("empty response from ansible api", 500);

    const playbookRepository = container.resolve<IPlaybookRepository>("IPlaybookRepository");

    const playbooks = await playbookRepository?.findAll();
    if (!playbooks) return responseJson("failed to fetch playbooks from db", 500);

    return responseJson(
        playbooks.filter((playbook) => playbookFilenames.includes(playbook.filename)
        ), 200);
};

export async function POST(req: NextRequest) {
    const reqClone = req.clone();
    const formData = parseMultipartText(await reqClone.text());

    const file = formData?.file;
    if (!file || !file.data || !file.name)
        return responseJson("no file or invalid form-data", 400);

    const playbook = {
        ...createPlaybookSchema.parse(formData),
        filename: file.name,
    };

    const newFormData = new FormData();
    newFormData.append('file', new Blob([file.data]), file.name);

    let response;
    try {
        response = await fetch(ANSIBLE_API + '/playbooks/', {
            method: 'POST',
            body: newFormData,
            headers: ansibleAuthHeader(),
        });

        if (!response.ok)
            return responseJson({ error: await response.text() }, 500);
    } catch (e) {
        return responseJson("failed to upload playbook to ansible api: " + e, 500);
    }

    const playbookRepository = container.resolve<IPlaybookRepository>("IPlaybookRepository");
    try {
        await playbookRepository?.create(playbook);
    } catch (e) {
        return responseJson("failed to save playbook in db: " + e, 500);
    }

    return responseJson({ message: "Playbook uploaded successfully" }, 200);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMultipartText(log: any) {
    // Remove [0] prefixes and join lines
    const cleaned = log
        .split('\n')
        .map((line: string) => line.replace(/^\[\d+\]\s?/, ''))
        .join('\n')
        .trim();

    // Automatically detect the boundary string
    const boundaryMatch = cleaned.match(/-+([A-Za-z0-9]+)\r?\n/);
    const boundary = boundaryMatch ? boundaryMatch[1] : null;
    if (!boundary) throw new Error("Boundary not found");

    // Split by boundaries
    const parts = cleaned.split(new RegExp(`-+${boundary}-*\\r?\\n?`)).filter(Boolean);

    const result = {
        file: { name: null, data: null },
        name: null,
        description: null
    };

    for (const part of parts) {
        if (part.includes('name="file"')) {
            // Extract filename
            const filenameMatch = part.match(/filename="([^"]+)"/);
            result.file.name = filenameMatch ? filenameMatch[1] : null;

            // Extract file data (everything after Content-Type)
            const split = part.split(/Content-Type: [^\n]+\n/);
            const fileData = split[1] ? split[1].trim() : null;
            result.file.data = fileData;
        } else if (part.includes('name="name"')) {
            const match = part.split(/\r?\n\r?\n/)[1];
            result.name = match ? match.trim() : null;
        } else if (part.includes('name="description"')) {
            const match = part.split(/\r?\n\r?\n/)[1];
            result.description = match ? match.trim() : null;
        }
    }

    return result;
}