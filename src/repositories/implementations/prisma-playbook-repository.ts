import { prisma } from "@/lib/prismaClient";
import { Playbook, Task } from "@/types/playbook";

export class PrismaPlaybookRepository {
    async create(playbook: Playbook) {
        return await prisma.playbook.create({ data: playbook });
    }
    async findAll() {
        return await prisma.playbook.findMany({
            orderBy: { name: "asc" }
        })
    }
    async findByFilename(filename: string) {
        return await prisma.playbook.findFirst({
            where: { filename }
        })
    }
    async deleteByFilename(filename: string) {
        const result = await prisma.playbook.deleteMany({
            where: { filename }
        })
        if (result) return true;
        return false;
    }
}