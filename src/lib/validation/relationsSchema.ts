import { z } from 'zod';

export const UserResponseSchema: z.ZodTypeAny = z.lazy(() =>
  z.object({
    _id: z.string(),
    username: z.string(),
    role: z.enum(['admin', 'user']),
    computers: z.array(ComputerResponseSchema).optional(),
  })
);

export const ComputerResponseSchema: z.ZodTypeAny = z.lazy(() =>
  z.object({
    _id: z.string(),
    hostname: z.string(),
    address: z.string(),
    status: z.enum(['active', 'inactive']),
    users: z.array(UserResponseSchema).optional(),
  })
);

export const UsersListResponse = z.array(UserResponseSchema);
export const ComputersListResponse = z.array(ComputerResponseSchema);
