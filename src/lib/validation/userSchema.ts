import { z } from 'zod';

export const loginCredentialsSchema = z.object({
  username: z.string().max(30),
  password: z.string()
})

export const createUserSchema = z.object({
    username: z.string().max(30),
    password: z.string().min(4),
    role: z.enum(['admin', 'user'])
})

export const updateUserSchema = z.object({
    username: z.string().max(30).optional(),
    password: z.string().min(4).optional(),
    role: z.enum(['admin', 'user']).optional()
})