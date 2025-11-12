import { container } from "@/lib/container";
import { ansibleAuthHeader } from "@/lib/token/functions";
import { responseJson } from "@/lib/utils";
import { IPlaybookRepository } from "@/repositories/playbook-repository";
import { NextRequest } from "next/server";

const ANSIBLE_API = process.env.ANSIBLE_API ?? 'http://localhost:8000/api';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const filename = (await params).filename;
    
    const playbookRepository = container.resolve<IPlaybookRepository>("IPlaybookRepository");

    const playbook = await playbookRepository?.findByFilename(filename);
    if (!playbook) return responseJson("not found", 404);

    return responseJson(playbook);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const filename = (await params).filename;

    const response = await fetch(ANSIBLE_API + '/playbooks/' + filename, {
        method: 'DELETE',
        headers: ansibleAuthHeader()
    });

    return responseJson(!!response.ok);
}