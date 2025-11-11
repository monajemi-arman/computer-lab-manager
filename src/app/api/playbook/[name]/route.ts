import { ansibleAuthHeader } from "@/lib/token/functions";
import { responseJson } from "@/lib/utils";
import { NextRequest } from "next/server";

const ANSIBLE_API = process.env.ANSIBLE_API ?? 'http://localhost:8000/api';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const name = (await params).name;

    throw new Error("Not implemented");
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const name = (await params).name;

    const response = await fetch(ANSIBLE_API + '/playbooks/' + name, {
        method: 'DELETE',
        headers: ansibleAuthHeader()
    });

    return responseJson(!!response.ok);
}