/**
 * Manual Jest mock for CommunicationClientManager.
 *
 * Used automatically by Jest when a test calls:
 *   jest.mock("...../api/CommunicationClientManager")
 *
 * `mockCommunicationClient` exposes all methods of the real CommunicationClient
 * as `jest.fn()`, so individual tests can configure return values with:
 *   mockCommunicationClient.getUserMessages.mockResolvedValue(...)
 *
 * `communicationClientManager.getClient` is pre-wired to return
 * `mockCommunicationClient` by default, avoiding boilerplate setup in each test.
 * Tests that need a different client shape can override it with:
 *   (communicationClientManager.getClient as jest.Mock).mockReturnValue({...})
 */

import { CommunicationClient } from "../CommunicationClientManager";

export const mockCommunicationClient: jest.Mocked<CommunicationClient> = {
  getUserMessages: jest.fn(),
  getUserMessage: jest.fn(),
  upsertMessageStatusAttributes: jest.fn(),
  getThirdPartyMessagePrecondition: jest.fn(),
  getThirdPartyMessage: jest.fn(),
  getThirdPartyMessageAttachment: jest.fn(),
  getSendActivation: jest.fn(),
  upsertSendActivation: jest.fn(),
  createOrUpdateInstallation: jest.fn(),
  getPaymentInfoV2: jest.fn()
};

export const communicationClientManager = {
  getClient: jest.fn().mockReturnValue(mockCommunicationClient)
};
