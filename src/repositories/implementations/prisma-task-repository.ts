import { prisma } from "@/lib/prismaClient";
import { Task } from "@/types/playbook";
import { TaskStatus } from "@prisma/client";

export class PrismaTaskRepository {
    async create(task: Task) {
        return await prisma.task.create({ data: task });
    }
    async findPlaybookTasks(playbookId: number) {
        return await prisma.task.findMany({
            where: { playbookId }
        });
    }
    async findById(id: string) {
        return await prisma.task.findFirst({
            where: { id }
        })
    }
    async updateStatus(id: string, status: TaskStatus) {
        return await prisma.task.update({
            where: { id },
            data: { status }
        })
    }
    async deleteById(id: string) {
        const result = await prisma.task.deleteMany({
            where: { id }
        })
        if (result) return true;
        return false;
    }
}