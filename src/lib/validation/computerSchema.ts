import { z } from 'zod';

export const createComputerSchema = z.object({
  hostname: z.string().max(30),
  address: z.string().min(4),
  status: z.enum(['active', 'inactive']),
  users: z.array(z.string()).optional(),
})

export const updateComputerSchema = z.object({
  hostname: z.string().max(30).optional(),
  address: z.string().min(4).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  users: z.array(z.string()).optional(),
})