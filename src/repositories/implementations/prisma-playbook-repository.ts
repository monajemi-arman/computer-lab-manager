import { prisma } from "@/lib/prismaClient";

export class PrismaPlaybookRepository {
    async create(playbook: PlaybookCreateInput) {
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