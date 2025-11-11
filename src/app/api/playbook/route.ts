import { ansibleAuthHeader } from "@/lib/token/functions";
import { responseJson } from "@/lib/utils";
import { NextRequest } from "next/server";

const ANSIBLE_API = process.env.ANSIBLE_API ?? 'http://localhost:8000/api';

export const GET = async () => {
    return await fetch(ANSIBLE_API + '/playbooks', { headers: ansibleAuthHeader() });
};

export const POST = async (req: NextRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return responseJson("no file", 400);

    const newFormData = new FormData();
    newFormData.append('file', file, file.name);

    try {
        const response = await fetch(ANSIBLE_API + '/playbooks', {
            method: 'POST',
            body: formData,
            headers: ansibleAuthHeader()
        });

        if (!response.ok) return responseJson({ error: response.text() }, 500);

        return responseJson(await response.json());
    }
    finally {
        return responseJson("failed to upload playbook", 500);
    }
};