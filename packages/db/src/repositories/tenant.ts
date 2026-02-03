/**
 * Tenant repository
 */

import type { TenantConfig, Result } from '@linear-teams/shared';
import { err } from '@linear-teams/shared';

export interface TenantRepository {
  getById(id: string): Promise<Result<TenantConfig | null>>;
  getByLinearOrgId(linearOrgId: string): Promise<Result<TenantConfig | null>>;
  create(tenant: TenantConfig): Promise<Result<TenantConfig>>;
  update(id: string, updates: Partial<TenantConfig>): Promise<Result<TenantConfig>>;
  delete(id: string): Promise<Result<void>>;
  listActive(): Promise<Result<TenantConfig[]>>;
}

/**
 * Stub implementation - replace with actual database implementation
 */
export class TenantRepositoryStub implements TenantRepository {
  async getById(_id: string): Promise<Result<TenantConfig | null>> {
    return err(new Error('Not implemented'));
  }

  async getByLinearOrgId(_linearOrgId: string): Promise<Result<TenantConfig | null>> {
    return err(new Error('Not implemented'));
  }

  async create(_tenant: TenantConfig): Promise<Result<TenantConfig>> {
    return err(new Error('Not implemented'));
  }

  async update(
    _id: string,
    _updates: Partial<TenantConfig>
  ): Promise<Result<TenantConfig>> {
    return err(new Error('Not implemented'));
  }

  async delete(_id: string): Promise<Result<void>> {
    return err(new Error('Not implemented'));
  }

  async listActive(): Promise<Result<TenantConfig[]>> {
    return err(new Error('Not implemented'));
  }
}
