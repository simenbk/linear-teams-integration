/**
 * Shared constants
 */

/** Queue names for Azure Service Bus */
export const QUEUE_NAMES = {
  LINEAR_WEBHOOKS: 'linear-webhooks',
  TEAMS_SUBMISSIONS: 'teams-submissions',
  SYNC_PROCESSOR: 'sync-processor',
} as const;

/** HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/** Linear webhook signature header */
export const LINEAR_SIGNATURE_HEADER = 'linear-signature';

/** Retry configuration */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
  BACKOFF_MULTIPLIER: 2,
} as const;

/** Cache TTL values in seconds */
export const CACHE_TTL = {
  TENANT_CONFIG: 300, // 5 minutes
  CHANNEL_CONFIG: 300, // 5 minutes
  LINEAR_USER: 3600, // 1 hour
} as const;
