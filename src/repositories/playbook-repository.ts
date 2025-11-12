export interface IPlaybookRepository {
    create(playbook: Playbook): Promise<Playbook>
    findAll(): Promise<Playbook[]>
    findByFilename(filename: string): Promise<Playbook | null>
    deleteByFilename(filename: string): Promise<boolean>
}