import { z } from 'zod';

export const createPlaybookSchema = z.object({
  name: z.string().max(50),
  filename: z.string().max(50).optional(),
  description: z.string().max(100),
})
