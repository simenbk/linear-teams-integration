/**
 * Multi-tenant configuration types
 */

/**
 * Tenant-level configuration
 */
export interface TenantConfig {
  /** Unique tenant ID (Azure AD tenant ID) */
  id: string;
  /** Display name of the tenant/organization */
  name: string;
  /** Linear organization ID */
  linearOrganizationId: string;
  /** Encrypted Linear API key */
  linearApiKeyEncrypted: string;
  /** Linear webhook signing secret (encrypted) */
  linearWebhookSecretEncrypted: string;
  /** Whether the integration is active */
  isActive: boolean;
  /** Tenant creation timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
  /** Optional metadata */
  metadata?: TenantMetadata;
}

export interface TenantMetadata {
  /** Contact email for the tenant admin */
  adminEmail?: string;
  /** Subscription tier */
  tier?: 'free' | 'pro' | 'enterprise';
  /** Custom branding settings */
  branding?: {
    /** Custom bot display name */
    botDisplayName?: string;
    /** Accent color for Adaptive Cards */
    accentColor?: string;
  };
}

/**
 * Tenant provisioning status
 */
export type TenantStatus = 'pending' | 'active' | 'suspended' | 'deleted';

/**
 * Result of tenant lookup
 */
export interface TenantLookupResult {
  tenant: TenantConfig | null;
  status: TenantStatus;
  error?: string;
}
