/**
 * Azure Function: Teams Bot messages endpoint
 */

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationBotFrameworkAuthenticationOptions,
} from 'botbuilder';
import { LinearTeamsBot } from '../bot.js';

// Bot Framework authentication configuration
const botFrameworkAuth = new ConfigurationBotFrameworkAuthentication(
  {} as ConfigurationBotFrameworkAuthenticationOptions,
  {
    MicrosoftAppId: process.env['MICROSOFT_APP_ID'] ?? '',
    MicrosoftAppPassword: process.env['MICROSOFT_APP_PASSWORD'] ?? '',
    MicrosoftAppTenantId: process.env['MICROSOFT_APP_TENANT_ID'] ?? '',
    MicrosoftAppType: 'MultiTenant',
  }
);

const adapter = new CloudAdapter(botFrameworkAuth);

// Error handler
adapter.onTurnError = async (context, error) => {
  console.error(`Bot error: ${error}`);
  await context.sendActivity('Sorry, something went wrong. Please try again.');
};

const bot = new LinearTeamsBot();

/**
 * HTTP trigger for Teams bot messages
 */
async function messagesHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Bot message received');

  try {
    const body = await request.text();
    const authHeader = request.headers.get('authorization') ?? '';

    // Process the incoming activity
    const response = await adapter.process(
      {
        body: JSON.parse(body),
        headers: Object.fromEntries(request.headers.entries()),
        method: request.method,
      } as never,
      {
        status: (code: number) => ({ status: code }),
        send: (body: unknown) => ({ body }),
        end: () => ({}),
        setHeader: () => ({}),
      } as never,
      (turnContext) => bot.run(turnContext)
    );

    return {
      status: 200,
      body: '',
    };
  } catch (error) {
    context.error('Error processing message:', error);
    return {
      status: 500,
      body: 'Internal server error',
    };
  }
}

app.http('messages', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/messages',
  handler: messagesHandler,
});
