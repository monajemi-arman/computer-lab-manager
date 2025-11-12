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

export const POST = async (req: NextRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return responseJson("no file", 400);

    const playbook: Playbook = {
        ...createPlaybookSchema.parse(formData),
        filename: file.name
    };

    const newFormData = new FormData();
    newFormData.append('file', file, file.name);

    let response;
    try {
        response = await fetch(ANSIBLE_API + '/playbooks', {
            method: 'POST',
            body: formData,
            headers: ansibleAuthHeader()
        });

        if (!response.ok) return responseJson({ error: response.text() }, 500);
    } catch (e) {
        return responseJson("failed to upload playbook to ansible api: " + e, 500);
    }

    if (!response) return responseJson("failed to upload playbook to anisble api", 500);

    const playbookRepository = container.resolve<IPlaybookRepository>("IPlaybookRepository");
    try {
        await playbookRepository?.create(playbook);
    } catch (e) {
        return responseJson("failed to save playbook in db: " + e, 500);
    }
};