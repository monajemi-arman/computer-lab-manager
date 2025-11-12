import { Operation } from '@/lib/systems-orchestrator/operation';
import { container } from '@/lib/container';
import { IComputerRepository } from '@/repositories/computer-repository';
import { getIsAdmin } from '@/app/actions';
import { responseJson } from '@/lib/utils';
import { NextRequest } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ hostname: string }> }
) {
    if (!await getIsAdmin())
        return responseJson("not authorized for action", 401);

    const hostname = (await params).hostname;

    const op = new Operation(hostname);
    const result = await op.test();
    if (result) {
        const computerRespository = container.resolve<IComputerRepository>("IComputerRepository");
        const computer = computerRespository ? await computerRespository?.findByHostname(hostname) : null;
        if (computer) {
            computer.status = 'active';
            await computerRespository?.update(computer.id, computer);
            
            return responseJson("success");
        }
    }

    return responseJson("fail", 500);
}