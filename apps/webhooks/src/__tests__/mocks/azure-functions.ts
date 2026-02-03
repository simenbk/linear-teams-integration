import { vi } from 'vitest';
import type {
  HttpRequest,
  InvocationContext,
  HttpRequestInit,
} from '@azure/functions';

export function createMockInvocationContext(
  functionName: string = 'linear-webhook'
): InvocationContext {
  return {
    functionName,
    invocationId: 'invocation-123',
    log: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    extraInputs: {
      get: vi.fn(),
      set: vi.fn(),
    },
    extraOutputs: {
      get: vi.fn(),
      set: vi.fn(),
    },
    options: {
      trigger: {
        type: 'httpTrigger',
        methods: ['POST'],
        authLevel: 'anonymous',
        route: 'webhooks/linear',
        name: 'request',
      },
      return: {
        type: 'http',
        name: '$return',
      },
      extraInputs: [],
      extraOutputs: [],
    },
    triggerMetadata: {},
    retryContext: undefined,
    traceContext: {
      traceParent: undefined,
      traceState: undefined,
      attributes: {},
    },
  } as unknown as InvocationContext;
}

export function createMockHttpRequest(
  options: Partial<HttpRequestInit> & {
    body?: string;
    headers?: Record<string, string>;
  } = {}
): HttpRequest {
  const headers = new Headers(options.headers);
  const body = options.body ?? '';

  return {
    method: options.method ?? 'POST',
    url: options.url ?? 'http://localhost:7071/api/webhooks/linear',
    headers,
    query: new URLSearchParams(),
    params: {},
    get body() {
      return body;
    },
    text: vi.fn().mockResolvedValue(body),
    json: vi.fn().mockResolvedValue(JSON.parse(body || '{}')),
    formData: vi.fn().mockResolvedValue(new FormData()),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    bodyUsed: false,
    user: null,
  } as unknown as HttpRequest;
}

export function createMockQueueClient() {
  return {
    send: vi.fn().mockResolvedValue({ success: true, data: 'message-123' }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}
