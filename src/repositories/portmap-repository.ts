import { PortMap } from "@prisma/client"

export interface IPortMapRepository {
    create(portMap: PortMapInput): Promise<PortMap>
    findAll(): Promise<PortMap[]>
    findByLocalPort(localPort: number): Promise<PortMap | null>
    findByHostname(hostname: string): Promise<PortMap[]>
    findByOwner(owner: string): Promise<PortMap[]>
    deleteByLocalPort(localPort: number): Promise<boolean>
}