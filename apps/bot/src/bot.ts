/**
 * Teams Bot handler
 */

import {
  TurnContext,
  TeamsActivityHandler,
  CardFactory,
} from 'botbuilder';
import {
  createSubmissionFormCard,
  serializeConversationReference,
} from '@linear-teams/teams-client';
import type { TeamsSubmission, SubmissionType } from '@linear-teams/shared';
import { generateId, nowISO } from '@linear-teams/shared';

export class LinearTeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      for (const member of context.activity.membersAdded ?? []) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            'Hello! I help you submit bugs and feature requests to Linear. ' +
              'Use the command "submit" to get started.'
          );
        }
      }
      await next();
    });
  }

  private async handleMessage(context: TurnContext): Promise<void> {
    const text = context.activity.text?.trim().toLowerCase() ?? '';

    // Handle commands
    if (text === 'submit' || text === 'bug' || text === 'feature') {
      await this.showSubmissionForm(context);
      return;
    }

    if (text === 'help') {
      await this.showHelp(context);
      return;
    }

    // Handle Adaptive Card submissions
    if (context.activity.value) {
      await this.handleCardSubmission(context);
      return;
    }

    // Default response
    await context.sendActivity(
      'I can help you submit bugs and features to Linear. Type "submit" to get started, or "help" for more options.'
    );
  }

  private async showSubmissionForm(context: TurnContext): Promise<void> {
    const card = createSubmissionFormCard();
    await context.sendActivity({ attachments: [card] });
  }

  private async showHelp(context: TurnContext): Promise<void> {
    await context.sendActivity({
      attachments: [
CardFactory.heroCard(
          'Linear Integration Help',
          '**Commands:**\n\n' +
            '• **submit** - Open the bug/feature submission form\n' +
            '• **bug** - Submit a bug report\n' +
            '• **feature** - Submit a feature request\n' +
            '• **help** - Show this help message\n\n' +
            'Issues submitted here will be synced to Linear.'
        ),
      ],
    });
  }

  private async handleCardSubmission(context: TurnContext): Promise<void> {
    const value = context.activity.value as Record<string, unknown>;

    if (value['action'] !== 'submitIssue') {
      return;
    }

    // Extract form data
    const submissionType = value['type'] as SubmissionType;
    const title = value['title'] as string;
    const description = value['description'] as string;
    const priority = parseInt(value['priority'] as string, 10) as 1 | 2 | 3 | 4;

    // Validate required fields
    if (!title || !description || !submissionType) {
      await context.sendActivity('Please fill in all required fields.');
      return;
    }

    // Create submission object
    const submission: TeamsSubmission = {
      id: generateId(),
      type: submissionType,
      title,
      description,
      priority,
      submittedBy: {
        aadObjectId: context.activity.from.aadObjectId ?? '',
        name: context.activity.from.name ?? 'Unknown User',
        email: undefined, // Would need Graph API to get email
      },
      conversationReference: serializeConversationReference(
        TurnContext.getConversationReference(context.activity)
      ),
      submittedAt: nowISO(),
    };

    // TODO: Queue the submission for processing
    void submission;

    await context.sendActivity(
      `✓ Your ${submissionType} "${title}" has been submitted and will be created in Linear shortly.`
    );
  }
}
