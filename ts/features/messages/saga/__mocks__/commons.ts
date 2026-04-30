/**
 * Manual Jest mock for messages/saga/commons.ts
 *
 * Used automatically by Jest when a test calls:
 *   jest.mock("../commons")
 *
 * Re-uses `mockCommunicationClient` from the CommunicationClientManager manual
 * mock, so individual tests can configure return values on its methods with:
 *   mockCommunicationClient.getUserMessages.mockResolvedValue(...)
 *
 * `getCommunicationClient` is pre-wired to return `mockCommunicationClient` by
 * default, avoiding boilerplate setup in each test.
 */
import { mockCommunicationClient } from "../../../../api/__mocks__/CommunicationClientManager";

export { mockCommunicationClient };

export const getCommunicationClient = jest
  .fn()
  .mockReturnValue(mockCommunicationClient);
