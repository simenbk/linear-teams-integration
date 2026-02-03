/**
 * Sync mapping repository
 */

import type { SyncMapping, Result } from '@linear-teams/shared';
import { err } from '@linear-teams/shared';

export interface SyncMappingRepository {
  getById(id: string): Promise<Result<SyncMapping | null>>;
  getByTeamsMessage(
    tenantId: string,
    teamsMessageId: string
  ): Promise<Result<SyncMapping | null>>;
  getByLinearIssue(
    tenantId: string,
    linearIssueId: string
  ): Promise<Result<SyncMapping | null>>;
  create(mapping: SyncMapping): Promise<Result<SyncMapping>>;
  updateLastSynced(id: string, timestamp: string): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  listByTenant(
    tenantId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Result<SyncMapping[]>>;
}

/**
 * Stub implementation - replace with actual database implementation
 */
export class SyncMappingRepositoryStub implements SyncMappingRepository {
  async getById(_id: string): Promise<Result<SyncMapping | null>> {
    return err(new Error('Not implemented'));
  }

  async getByTeamsMessage(
    _tenantId: string,
    _teamsMessageId: string
  ): Promise<Result<SyncMapping | null>> {
    return err(new Error('Not implemented'));
  }

  async getByLinearIssue(
    _tenantId: string,
    _linearIssueId: string
  ): Promise<Result<SyncMapping | null>> {
    return err(new Error('Not implemented'));
  }

  async create(_mapping: SyncMapping): Promise<Result<SyncMapping>> {
    return err(new Error('Not implemented'));
  }

  async updateLastSynced(_id: string, _timestamp: string): Promise<Result<void>> {
    return err(new Error('Not implemented'));
  }

  async delete(_id: string): Promise<Result<void>> {
    return err(new Error('Not implemented'));
  }

  async listByTenant(
    _tenantId: string,
    _options?: { limit?: number; offset?: number }
  ): Promise<Result<SyncMapping[]>> {
    return err(new Error('Not implemented'));
  }
}
