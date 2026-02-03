import { describe, it, expect } from 'vitest';
import {
  createIssueCard,
  createSubmissionFormCard,
  createIssueUpdateCard,
} from '../cards.js';
import type { LinearIssueData } from '@linear-teams/shared';

function createMockIssue(overrides?: Partial<LinearIssueData>): LinearIssueData {
  return {
    id: 'issue-123',
    identifier: 'TEST-1',
    title: 'Test Issue Title',
    description: 'This is a test description',
    priority: 2,
    state: { id: 'state-1', name: 'In Progress', type: 'started' },
    team: { id: 'team-1', key: 'TEST', name: 'Test Team' },
    labels: [{ id: 'label-1', name: 'Bug', color: '#ff0000' }],
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    ...overrides,
  };
}

describe('createIssueCard', () => {
  it('should create a valid adaptive card', () => {
    const issue = createMockIssue();
    const card = createIssueCard(issue, 'https://linear.app/team/issue/TEST-1');

    expect(card.contentType).toBe('application/vnd.microsoft.card.adaptive');
    expect(card.content.type).toBe('AdaptiveCard');
    expect(card.content.version).toBe('1.4');
  });

  it('should include issue identifier and title', () => {
    const issue = createMockIssue({
      identifier: 'PROJ-42',
      title: 'Important Feature',
    });
    const card = createIssueCard(issue, 'https://linear.app/issue');

    const titleBlock = card.content.body[0];
    expect(titleBlock.text).toBe('PROJ-42: Important Feature');
  });

  it('should include status fact', () => {
    const issue = createMockIssue({
      state: { id: 's1', name: 'Done', type: 'completed' },
    });
    const card = createIssueCard(issue, 'https://linear.app/issue');

    const factSet = card.content.body[1];
    const statusFact = factSet.facts.find(
      (f: { title: string }) => f.title === 'Status'
    );
    expect(statusFact?.value).toBe('Done');
  });

  it('should include priority label', () => {
    const issue = createMockIssue({ priority: 1 });
    const card = createIssueCard(issue, 'https://linear.app/issue');

    const factSet = card.content.body[1];
    const priorityFact = factSet.facts.find(
      (f: { title: string }) => f.title === 'Priority'
    );
    expect(priorityFact?.value).toBe('Urgent');
  });

  it('should include team name', () => {
    const issue = createMockIssue({
      team: { id: 't1', key: 'ENG', name: 'Engineering' },
    });
    const card = createIssueCard(issue, 'https://linear.app/issue');

    const factSet = card.content.body[1];
    const teamFact = factSet.facts.find(
      (f: { title: string }) => f.title === 'Team'
    );
    expect(teamFact?.value).toBe('Engineering');
  });

  it('should include assignee when present', () => {
    const issue = createMockIssue({
      assignee: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    });
    const card = createIssueCard(issue, 'https://linear.app/issue');

    const factSet = card.content.body[1];
    const assigneeFact = factSet.facts.find(
      (f: { title: string }) => f.title === 'Assignee'
    );
    expect(assigneeFact?.value).toBe('John Doe');
  });

  it('should not include assignee when not present', () => {
    const issue = createMockIssue();
    // Create an issue without assignee by not including it in the spread
    const issueWithoutAssignee = {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      state: issue.state,
      team: issue.team,
      labels: issue.labels,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    } as typeof issue;
    const card = createIssueCard(issueWithoutAssignee, 'https://linear.app/issue');

    const factSet = card.content.body[1];
    const assigneeFact = factSet.facts.find(
      (f: { title: string }) => f.title === 'Assignee'
    );
    expect(assigneeFact).toBeUndefined();
  });

  it('should include description when present', () => {
    const issue = createMockIssue({ description: 'Detailed description here' });
    const card = createIssueCard(issue, 'https://linear.app/issue');

    const descriptionBlock = card.content.body.find(
      (b: { text?: string }) => b.text === 'Detailed description here'
    );
    expect(descriptionBlock).toBeDefined();
  });

  it('should not include description when not present', () => {
    const issue = createMockIssue();
    // Create an issue without description
    const issueWithoutDesc = {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      priority: issue.priority,
      state: issue.state,
      team: issue.team,
      labels: issue.labels,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    } as typeof issue;
    const card = createIssueCard(issueWithoutDesc, 'https://linear.app/issue');

    expect(card.content.body.length).toBe(2); // Only title and factset
  });

  it('should include action to open in Linear', () => {
    const issue = createMockIssue();
    const url = 'https://linear.app/team/issue/TEST-1';
    const card = createIssueCard(issue, url);

    const action = card.content.actions[0];
    expect(action.type).toBe('Action.OpenUrl');
    expect(action.title).toBe('View in Linear');
    expect(action.url).toBe(url);
  });
});

describe('createSubmissionFormCard', () => {
  it('should create a valid adaptive card', () => {
    const card = createSubmissionFormCard();

    expect(card.contentType).toBe('application/vnd.microsoft.card.adaptive');
    expect(card.content.type).toBe('AdaptiveCard');
    expect(card.content.version).toBe('1.4');
  });

  it('should include title', () => {
    const card = createSubmissionFormCard();

    const titleBlock = card.content.body[0];
    expect(titleBlock.text).toBe('Submit Bug or Feature Request');
  });

  it('should include type choice set', () => {
    const card = createSubmissionFormCard();

    const typeInput = card.content.body.find(
      (b: { id?: string }) => b.id === 'type'
    );
    expect(typeInput).toBeDefined();
    expect(typeInput.isRequired).toBe(true);
    expect(typeInput.choices).toHaveLength(2);
  });

  it('should include title input', () => {
    const card = createSubmissionFormCard();

    const titleInput = card.content.body.find(
      (b: { id?: string }) => b.id === 'title'
    );
    expect(titleInput).toBeDefined();
    expect(titleInput.isRequired).toBe(true);
    expect(titleInput.maxLength).toBe(200);
  });

  it('should include description input', () => {
    const card = createSubmissionFormCard();

    const descInput = card.content.body.find(
      (b: { id?: string }) => b.id === 'description'
    );
    expect(descInput).toBeDefined();
    expect(descInput.isRequired).toBe(true);
    expect(descInput.isMultiline).toBe(true);
    expect(descInput.maxLength).toBe(2000);
  });

  it('should include priority choice set with default value', () => {
    const card = createSubmissionFormCard();

    const priorityInput = card.content.body.find(
      (b: { id?: string }) => b.id === 'priority'
    );
    expect(priorityInput).toBeDefined();
    expect(priorityInput.value).toBe('3'); // Medium as default
    expect(priorityInput.choices).toHaveLength(4);
  });

  it('should include submit action', () => {
    const card = createSubmissionFormCard();

    const action = card.content.actions[0];
    expect(action.type).toBe('Action.Submit');
    expect(action.title).toBe('Submit');
    expect(action.data.action).toBe('submitIssue');
  });
});

describe('createIssueUpdateCard', () => {
  it('should create a valid adaptive card', () => {
    const issue = createMockIssue();
    const card = createIssueUpdateCard(
      issue,
      'https://linear.app/issue',
      'status_changed',
      'Status changed to Done'
    );

    expect(card.contentType).toBe('application/vnd.microsoft.card.adaptive');
    expect(card.content.type).toBe('AdaptiveCard');
    expect(card.content.version).toBe('1.4');
  });

  it('should show correct label for status_changed', () => {
    const issue = createMockIssue();
    const card = createIssueUpdateCard(
      issue,
      'https://linear.app/issue',
      'status_changed',
      'Changed to Done'
    );

    const labelBlock = card.content.body[0];
    expect(labelBlock.text).toBe('Status Updated');
  });

  it('should show correct label for comment_added', () => {
    const issue = createMockIssue();
    const card = createIssueUpdateCard(
      issue,
      'https://linear.app/issue',
      'comment_added',
      'New comment from John'
    );

    const labelBlock = card.content.body[0];
    expect(labelBlock.text).toBe('New Comment');
  });

  it('should show correct label for assigned', () => {
    const issue = createMockIssue();
    const card = createIssueUpdateCard(
      issue,
      'https://linear.app/issue',
      'assigned',
      'Assigned to Jane'
    );

    const labelBlock = card.content.body[0];
    expect(labelBlock.text).toBe('Assignment Changed');
  });

  it('should include issue identifier and title', () => {
    const issue = createMockIssue({
      identifier: 'BUG-99',
      title: 'Critical Bug',
    });
    const card = createIssueUpdateCard(
      issue,
      'https://linear.app/issue',
      'status_changed',
      'Details'
    );

    const titleBlock = card.content.body[1];
    expect(titleBlock.text).toBe('BUG-99: Critical Bug');
  });

  it('should include details text', () => {
    const issue = createMockIssue();
    const card = createIssueUpdateCard(
      issue,
      'https://linear.app/issue',
      'comment_added',
      'John commented: Looking into this'
    );

    const detailsBlock = card.content.body[2];
    expect(detailsBlock.text).toBe('John commented: Looking into this');
  });

  it('should include action to open in Linear', () => {
    const issue = createMockIssue();
    const url = 'https://linear.app/team/issue/TEST-1';
    const card = createIssueUpdateCard(issue, url, 'status_changed', 'Details');

    const action = card.content.actions[0];
    expect(action.type).toBe('Action.OpenUrl');
    expect(action.title).toBe('View in Linear');
    expect(action.url).toBe(url);
  });
});
