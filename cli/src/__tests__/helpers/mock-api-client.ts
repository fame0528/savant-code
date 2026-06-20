import { mock } from 'bun:test'

import type { Savant-CodeApiClient } from '../../utils/savant-code-api'

export interface MockApiClientOverrides {
  get?: ReturnType<typeof mock>
  post?: ReturnType<typeof mock>
  put?: ReturnType<typeof mock>
  patch?: ReturnType<typeof mock>
  delete?: ReturnType<typeof mock>
  request?: ReturnType<typeof mock>
  me?: ReturnType<typeof mock>
  usage?: ReturnType<typeof mock>
  loginCode?: ReturnType<typeof mock>
  loginStatus?: ReturnType<typeof mock>
  publish?: ReturnType<typeof mock>
  logout?: ReturnType<typeof mock>
  feedback?: ReturnType<typeof mock>
  baseUrl?: string
  authToken?: string
}

/**
 * Default OK response for mock API methods.
 * Returns { ok: true, status: 200 } without data, matching our ApiResponse type
 * where `data` is optional for responses without a body.
 */
const defaultOkResponse = () =>
  Promise.resolve({ ok: true as const, status: 200 })

/**
 * Creates a mock Savant-CodeApiClient with sensible defaults.
 * All methods return { ok: true, status: 200 } by default.
 * Pass overrides to customize specific methods.
 */
export const createMockApiClient = (
  overrides: MockApiClientOverrides = {},
): Savant-CodeApiClient => ({
  get: (overrides.get ?? mock(defaultOkResponse)) as Savant-CodeApiClient['get'],
  post: (overrides.post ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['post'],
  put: (overrides.put ?? mock(defaultOkResponse)) as Savant-CodeApiClient['put'],
  patch: (overrides.patch ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['patch'],
  delete: (overrides.delete ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['delete'],
  request: (overrides.request ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['request'],
  me: (overrides.me ?? mock(defaultOkResponse)) as Savant-CodeApiClient['me'],
  usage: (overrides.usage ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['usage'],
  loginCode: (overrides.loginCode ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['loginCode'],
  loginStatus: (overrides.loginStatus ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['loginStatus'],
  publish: (overrides.publish ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['publish'],
  logout: (overrides.logout ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['logout'],
  feedback: (overrides.feedback ??
    mock(defaultOkResponse)) as Savant-CodeApiClient['feedback'],
  baseUrl: overrides.baseUrl ?? 'https://test.savant-code.dev',
  authToken: overrides.authToken,
})
