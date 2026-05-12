import { TestServicesClientManager } from "../ServicesClientManager";

jest.mock("../../../definitions/services/client", () => ({
  createClient: jest.fn(() => ({ _type: "services", id: Math.random() }))
}));

const BASE_URL = "http://example.com";
const TOKEN_A = "token-a";
const TOKEN_B = "token-b";

describe("ServicesClientManager", () => {
  it("should return the same client when token and keyInfo are unchanged", () => {
    const manager = new TestServicesClientManager.ServicesClientManager!();
    const client1 = manager.getClient(BASE_URL, {
      token: TOKEN_A
    });
    const client2 = manager.getClient(BASE_URL, {
      token: TOKEN_A
    });
    expect(client1).toBe(client2);
  });

  it("should return a new client when the token changes", () => {
    const manager = new TestServicesClientManager.ServicesClientManager!();
    const client1 = manager.getClient(BASE_URL, {
      token: TOKEN_A
    });
    const client2 = manager.getClient(BASE_URL, {
      token: TOKEN_B
    });
    expect(client1).not.toBe(client2);
  });
});
