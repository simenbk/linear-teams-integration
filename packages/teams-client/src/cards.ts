/**
 * Adaptive Card builders for Teams
 */

import type { Attachment } from 'botbuilder';
import type { LinearIssueData } from '@linear-teams/shared';
import { LINEAR_PRIORITY_LABELS, type LinearPriority } from '@linear-teams/shared';

/**
 * Create an Adaptive Card for displaying a Linear issue
 */
export function createIssueCard(
  issue: LinearIssueData,
  issueUrl: string
): Attachment {
  const priorityLabel = LINEAR_PRIORITY_LABELS[issue.priority as LinearPriority];

  return {
    contentType: 'application/vnd.microsoft.card.adaptive',
    content: {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: `${issue.identifier}: ${issue.title}`,
          wrap: true,
          weight: 'Bolder',
          size: 'Medium',
        },
        {
          type: 'FactSet',
          facts: [
            { title: 'Status', value: issue.state.name },
            { title: 'Priority', value: priorityLabel },
            { title: 'Team', value: issue.team.name },
            ...(issue.assignee
              ? [{ title: 'Assignee', value: issue.assignee.name }]
              : []),
          ],
        },
        ...(issue.description
          ? [
              {
                type: 'TextBlock',
                text: issue.description,
                wrap: true,
                maxLines: 3,
              },
            ]
          : []),
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'View in Linear',
          url: issueUrl,
        },
      ],
    },
  };
}

/**
 * Create an Adaptive Card for the bug/feature submission form
 */
export function createSubmissionFormCard(): Attachment {
  return {
    contentType: 'application/vnd.microsoft.card.adaptive',
    content: {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Submit Bug or Feature Request',
          weight: 'Bolder',
          size: 'Medium',
        },
        {
          type: 'Input.ChoiceSet',
          id: 'type',
          label: 'Type',
          isRequired: true,
          choices: [
            { title: 'Bug', value: 'bug' },
            { title: 'Feature Request', value: 'feature' },
          ],
        },
        {
          type: 'Input.Text',
          id: 'title',
          label: 'Title',
          placeholder: 'Brief summary of the issue',
          isRequired: true,
          maxLength: 200,
        },
        {
          type: 'Input.Text',
          id: 'description',
          label: 'Description',
          placeholder: 'Detailed description...',
          isRequired: true,
          isMultiline: true,
          maxLength: 2000,
        },
        {
          type: 'Input.ChoiceSet',
          id: 'priority',
          label: 'Priority',
          value: '3',
          choices: [
            { title: 'Urgent', value: '1' },
            { title: 'High', value: '2' },
            { title: 'Medium', value: '3' },
            { title: 'Low', value: '4' },
          ],
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Submit',
          data: { action: 'submitIssue' },
        },
      ],
    },
  };
}

/**
 * Create an Adaptive Card for issue update notification
 */
export function createIssueUpdateCard(
  issue: LinearIssueData,
  issueUrl: string,
  updateType: 'status_changed' | 'comment_added' | 'assigned',
  details: string
): Attachment {
  const updateTypeLabels = {
    status_changed: 'Status Updated',
    comment_added: 'New Comment',
    assigned: 'Assignment Changed',
  };

  return {
    contentType: 'application/vnd.microsoft.card.adaptive',
    content: {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: updateTypeLabels[updateType],
          weight: 'Bolder',
          color: 'Accent',
        },
        {
          type: 'TextBlock',
          text: `${issue.identifier}: ${issue.title}`,
          wrap: true,
          weight: 'Bolder',
        },
        {
          type: 'TextBlock',
          text: details,
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'View in Linear',
          url: issueUrl,
        },
      ],
    },
  };
}
