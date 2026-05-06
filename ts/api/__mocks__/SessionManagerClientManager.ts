/**
 * Manual Jest mock for SessionManagerClientManager.
 *
 * Used automatically by Jest when a test calls:
 *   jest.mock("...../api/SessionManagerClientManager")
 *
 * `mockSessionManagerClient` exposes all methods of the real SessionManagerClient
 * as `jest.fn()`, so individual tests can configure return values with:
 *   mockSessionManagerClient.getSessionState.mockResolvedValue(...)
 *
 * `sessionManagerClientManager.getClient` is pre-wired to return
 * `mockSessionManagerClient` by default, avoiding boilerplate setup in each test.
 * Tests that need a different client shape can override it with:
 *   (sessionManagerClientManager.getClient as jest.Mock).mockReturnValue({...})
 */

import { SessionManagerClient } from "../SessionManagerClientManager";

export const mockSessionManagerClient: jest.Mocked<SessionManagerClient> = {
  fastLogin: jest.fn(),
  lvGenerateNonce: jest.fn(),
  getSessionState: jest.fn(),
  logout: jest.fn(),
  login: jest.fn(),
  testLogin: jest.fn(),
  healthcheck: jest.fn(),
  acs: jest.fn(),
  getMetadata: jest.fn(),
  getUserIdentity: jest.fn()
};

export const sessionManagerClientManager = {
  getClient: jest.fn().mockReturnValue(mockSessionManagerClient)
};
