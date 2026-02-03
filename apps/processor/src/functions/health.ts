/**
 * Azure Function: Health check endpoint
 */

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

async function healthHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return {
    status: 200,
    jsonBody: {
      status: 'healthy',
      service: 'processor',
      timestamp: new Date().toISOString(),
    },
  };
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/health',
  handler: healthHandler,
});
