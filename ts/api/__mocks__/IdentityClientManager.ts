/**
 * Manual Jest mock for IdentityClientManager.
 *
 * Used automatically by Jest when a test calls:
 *   jest.mock("...../api/IdentityClientManager")
 *
 * `mockIdentityClient` exposes all methods of the real IdentityClient
 * as `jest.fn()`, so individual tests can configure return values with:
 *   mockIdentityClient.getUserProfile.mockResolvedValue(...)
 *
 * `identityClientManager.getClient` is pre-wired to return
 * `mockIdentityClient` by default, avoiding boilerplate setup in each test.
 * Tests that need a different client shape can override it with:
 *   (identityClientManager.getClient as jest.Mock).mockReturnValue({...})
 */

import { IdentityClient } from "../IdentityClientManager";

export const mockIdentityClient: jest.Mocked<IdentityClient> = {
  upsertServicePreferences: jest.fn(),
  getServicePreferences: jest.fn(),
  getUserProfile: jest.fn(),
  updateProfile: jest.fn(),
  startEmailValidationProcess: jest.fn(),
  upsertUserDataProcessing: jest.fn(),
  getUserDataProcessing: jest.fn(),
  abortUserDataProcessing: jest.fn(),
  signMessage: jest.fn()
};

export const identityClientManager = {
  getClient: jest.fn().mockReturnValue(mockIdentityClient)
};
