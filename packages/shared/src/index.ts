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

export const DidDestinationType = {
  EXTENSION: 'EXTENSION',
  RING_GROUP: 'RING_GROUP',
  QUEUE: 'QUEUE',
  IVR: 'IVR',
  EXTERNAL: 'EXTERNAL',
  VOICEMAIL: 'VOICEMAIL',
} as const;

export type DidDestinationType =
  (typeof DidDestinationType)[keyof typeof DidDestinationType];

export const RingStrategy = {
  RINGALL: 'RINGALL',
  LEASTRECENT: 'LEASTRECENT',
  FEWESTCALLS: 'FEWESTCALLS',
  RANDOM: 'RANDOM',
  RRMEMORY: 'RRMEMORY',
} as const;

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

export const createExtensionSchema = z.object({
  number: z.string().min(2).max(16),
  displayName: z.string().max(80).optional(),
  sipPassword: z.string().min(8).max(64).optional(),
  callerId: z.string().max(32).optional(),
  dnd: z.boolean().optional(),
  forwardTo: z.string().max(32).optional().nullable(),
  voicemailEnabled: z.boolean().optional(),
  userId: z.string().optional().nullable(),
});

export const updateExtensionSchema = createExtensionSchema.partial();

export const createDidSchema = z.object({
  number: z.string().min(3).max(32),
  description: z.string().max(120).optional(),
  destinationType: z.nativeEnum(DidDestinationType),
  destinationRef: z.string().min(1).max(64),
  callerIdName: z.string().max(80).optional(),
  enabled: z.boolean().optional(),
});

export const updateDidSchema = createDidSchema.partial();

export const createRingGroupSchema = z.object({
  name: z.string().min(1).max(80),
  strategy: z.nativeEnum(RingStrategy).optional(),
  ringTimeout: z.number().int().min(5).max(120).optional(),
  extensionIds: z.array(z.string()).default([]),
});

export const createQueueSchema = z.object({
  name: z.string().min(1).max(80),
  extension: z.string().max(16).optional(),
  strategy: z.nativeEnum(RingStrategy).optional(),
  timeout: z.number().int().min(5).max(300).optional(),
  musicOnHold: z.string().max(40).optional(),
  extensionIds: z.array(z.string()).default([]),
});

export const createIvrSchema = z.object({
  name: z.string().min(1).max(80),
  greetingPrompt: z.string().max(80).optional(),
  timeoutSeconds: z.number().int().min(1).max(60).optional(),
  options: z.record(z.object({
    type: z.nativeEnum(DidDestinationType),
    ref: z.string(),
  })).default({}),
});

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
