/**
 * Sync mapping and configuration types
 */

/**
 * Mapping between Teams messages and Linear issues
 */
export interface SyncMapping {
  /** Unique mapping ID */
  id: string;
  /** Tenant ID this mapping belongs to */
  tenantId: string;
  /** Teams message ID */
  teamsMessageId: string;
  /** Teams conversation ID */
  teamsConversationId: string;
  /** Linear issue ID */
  linearIssueId: string;
  /** Linear issue identifier (e.g., "ENG-123") */
  linearIssueIdentifier: string;
  /** Direction of the original sync */
  direction: SyncDirection;
  /** Creation timestamp */
  createdAt: string;
  /** Last sync timestamp */
  lastSyncedAt: string;
}

export type SyncDirection = 'teams_to_linear' | 'linear_to_teams';

/**
 * Channel-level configuration for Teams-Linear sync
 */
export interface ChannelConfig {
  /** Unique config ID */
  id: string;
  /** Tenant ID this config belongs to */
  tenantId: string;
  /** Teams channel ID */
  teamsChannelId: string;
  /** Teams team ID */
  teamsTeamId: string;
  /** Linear team ID to sync with */
  linearTeamId: string;
  /** Linear team key (e.g., "ENG") */
  linearTeamKey: string;
  /** Whether to sync new issues from Teams to Linear */
  syncTeamsToLinear: boolean;
  /** Whether to post Linear updates to Teams */
  syncLinearToTeams: boolean;
  /** Whether to sync comments bidirectionally */
  syncComments: boolean;
  /** Whether to sync status changes */
  syncStatusChanges: boolean;
  /** Default priority for new issues (1-4) */
  defaultPriority: 1 | 2 | 3 | 4;
  /** Default labels to apply to new issues */
  defaultLabelIds: string[];
  /** Creation timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}
