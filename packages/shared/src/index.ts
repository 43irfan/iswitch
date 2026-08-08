import { z } from 'zod';

/** Roles locked in Plan.md */
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESELLER: 'RESELLER',
  RETAIL_CUSTOMER_ADMIN: 'RETAIL_CUSTOMER_ADMIN',
  WHOLESALE_CUSTOMER: 'WHOLESALE_CUSTOMER',
  END_USER: 'END_USER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const userRoleSchema = z.nativeEnum(UserRole);

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const APP_NAME = 'iSwitch';
