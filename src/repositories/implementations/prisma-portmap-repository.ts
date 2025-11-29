import { prisma } from "@/lib/prismaClient";
import { IPortMapRepository } from "../portmap-repository";
import { PortMap } from "@prisma/client";

export class PrismaPortMapRepository implements IPortMapRepository {
    async create(portMap: PortMapInput) {
        return await prisma.portMap.create({ data: portMap });
    }
    async findAll() {
        return await prisma.portMap.findMany({
            orderBy: { localPort: "asc" }
        })
    }
    async findByLocalPort(localPort: number) {
        return await prisma.portMap.findFirst({
            where: { localPort }
        })
    }
    async findByHostname(hostname: string) {
        return await prisma.portMap.findMany({
            where: { hostname }
        })
    }
    async findByOwner(owner: string) {
        return await prisma.portMap.findMany({
            where: { owner }
        })
    }
    async deleteByLocalPort(localPort: number) {
        const result = await prisma.portMap.deleteMany({
            where: { localPort }
        })
        if (result) return true;
        return false;
    }
}