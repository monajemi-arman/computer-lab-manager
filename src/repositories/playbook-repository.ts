import { Playbook } from "@prisma/client"

export interface IPlaybookRepository {
    create(playbook: PlaybookCreateInput): Promise<Playbook>
    findAll(): Promise<Playbook[]>
    findByFilename(filename: string): Promise<Playbook | null>
    deleteByFilename(filename: string): Promise<boolean>
}