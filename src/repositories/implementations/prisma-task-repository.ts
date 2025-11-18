import { prisma } from "@/lib/prismaClient";
import { TaskStatus, Task } from "@prisma/client";
import { ITaskRepository } from "../task-repository";

export class PrismaTaskRepository implements ITaskRepository {
    async create(task: TaskCreateInput) {
        return await prisma.task.create({ data: task });
    }
    async findPlaybookTasks(playbookId: number) {
        return await prisma.task.findMany({
            where: { playbookId },
            orderBy: { createdAt: 'desc' }
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