import { prisma } from "@/lib/prismaClient";

async function main() {
    await prisma.$connect();

    await prisma.playbook.createMany({
        data: [
            { name: 'Test', filename: 'test.yml', description: 'Check if playbooks can run' },
            { name: 'Upgrade', filename: 'upgrade-system-packages.yml', description: 'Update and upgrade system packages'}
        ]
    })
}

main()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })