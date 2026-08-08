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

export const AccountType = {
  PLATFORM: 'PLATFORM',
  RESELLER: 'RESELLER',
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: userRoleSchema,
  accountId: z.string(),
  account: z.object({
    id: z.string(),
    name: z.string(),
    type: z.nativeEnum(AccountType),
  }),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const APP_NAME = 'iSwitch';
export const SESSION_COOKIE = 'iswitch_sid';

export const ROLE_PORTAL_PATH: Record<UserRole, string> = {
  SUPER_ADMIN: '/portal/admin',
  RESELLER: '/portal/reseller',
  RETAIL_CUSTOMER_ADMIN: '/portal/retail',
  WHOLESALE_CUSTOMER: '/portal/wholesale',
  END_USER: '/portal/end-user',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  RESELLER: 'Reseller',
  RETAIL_CUSTOMER_ADMIN: 'Retail Customer Admin',
  WHOLESALE_CUSTOMER: 'Wholesale Customer',
  END_USER: 'End User',
};
