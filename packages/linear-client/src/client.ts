/**
 * Typed wrapper around @linear/sdk
 */

import { LinearClient as BaseLinearClient } from '@linear/sdk';
import type {
  LinearIssueData,
  LinearPriority,
  Result,
} from '@linear-teams/shared';
import { ok, err } from '@linear-teams/shared';

export interface CreateIssueParams {
  teamId: string;
  title: string;
  description?: string;
  priority?: LinearPriority;
  labelIds?: string[];
  assigneeId?: string;
}

export interface UpdateIssueParams {
  title?: string;
  description?: string;
  priority?: LinearPriority;
  stateId?: string;
  labelIds?: string[];
  assigneeId?: string;
}

export interface AddCommentParams {
  issueId: string;
  body: string;
}

/**
 * Typed Linear API client wrapper
 */
export class LinearClient {
  private client: BaseLinearClient;

  constructor(apiKey: string) {
    this.client = new BaseLinearClient({ apiKey });
  }

  /**
   * Create a new issue
   */
  async createIssue(
    params: CreateIssueParams
  ): Promise<Result<{ id: string; identifier: string; url: string }>> {
    // TODO: Implement actual Linear API call
    void params;
    return err(new Error('Not implemented'));
  }

  /**
   * Update an existing issue
   */
  async updateIssue(
    issueId: string,
    params: UpdateIssueParams
  ): Promise<Result<void>> {
    // TODO: Implement actual Linear API call
    void issueId;
    void params;
    return err(new Error('Not implemented'));
  }

  /**
   * Get an issue by ID
   */
  async getIssue(issueId: string): Promise<Result<LinearIssueData>> {
    // TODO: Implement actual Linear API call
    void issueId;
    return err(new Error('Not implemented'));
  }

  /**
   * Get an issue by identifier (e.g., "ENG-123")
   */
  async getIssueByIdentifier(
    identifier: string
  ): Promise<Result<LinearIssueData>> {
    // TODO: Implement actual Linear API call
    void identifier;
    return err(new Error('Not implemented'));
  }

  /**
   * Add a comment to an issue
   */
  async addComment(
    params: AddCommentParams
  ): Promise<Result<{ id: string }>> {
    // TODO: Implement actual Linear API call
    void params;
    return err(new Error('Not implemented'));
  }

  /**
   * Get teams for the organization
   */
  async getTeams(): Promise<
    Result<Array<{ id: string; key: string; name: string }>>
  > {
    // TODO: Implement actual Linear API call
    return err(new Error('Not implemented'));
  }

  /**
   * Get workflow states for a team
   */
  async getTeamStates(
    teamId: string
  ): Promise<Result<Array<{ id: string; name: string; type: string }>>> {
    // TODO: Implement actual Linear API call
    void teamId;
    return err(new Error('Not implemented'));
  }

  /**
   * Get labels for a team
   */
  async getTeamLabels(
    teamId: string
  ): Promise<Result<Array<{ id: string; name: string; color: string }>>> {
    // TODO: Implement actual Linear API call
    void teamId;
    return err(new Error('Not implemented'));
  }

  /**
   * Get the underlying Linear SDK client for advanced usage
   */
  getBaseClient(): BaseLinearClient {
    return this.client;
  }
}
