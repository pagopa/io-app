import { TestSessionManagerClientManager } from "../SessionManagerClientManager";

jest.mock("../../../definitions/session_manager/client", () => ({
  createClient: jest.fn(() => ({ _type: "session_manager", id: Math.random() }))
}));

jest.mock("../../utils/fetch", () => ({
  defaultRetryingFetch: jest.fn(() => jest.fn())
}));

const BASE_URL = "http://example.com";
const TOKEN_A = "token-a";
const TOKEN_B = "token-b";

describe("SessionManagerClientManager", () => {
  it("should return the same client when token is unchanged", () => {
    const manager =
      new TestSessionManagerClientManager.SessionManagerClientManager!();
    const client1 = manager.getClient(BASE_URL, { token: TOKEN_A });
    const client2 = manager.getClient(BASE_URL, { token: TOKEN_A });
    expect(client1).toBe(client2);
  });

  it("should return a new client when token changes", () => {
    const manager =
      new TestSessionManagerClientManager.SessionManagerClientManager!();
    const client1 = manager.getClient(BASE_URL, { token: TOKEN_A });
    const client2 = manager.getClient(BASE_URL, { token: TOKEN_B });
    expect(client1).not.toBe(client2);
  });
});
