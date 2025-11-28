import { z } from 'zod';

export const portForwardSchema = z.object({
    localPort: z.number().min(1024).max(65535),
    remotePort: z.number().min(1).max(65535),
    reverse: z.boolean().optional()
})
