import { ApiClientManager } from "../ApiClientManager";

type TestClientOptions = { token: string };

class ConcreteClientManager extends ApiClientManager<
  { id: number },
  TestClientOptions
> {
  protected createClient(
    _baseUrl: string,
    _clientOptions: TestClientOptions
  ): { id: number } {
    return { id: Math.random() };
  }
}

const BASE_URL = "http://example.com";
const TOKEN_A = "token-a";
const TOKEN_B = "token-b";

describe("ApiClientManager", () => {
  it("should return the same client when token is unchanged", () => {
    const manager = new ConcreteClientManager();
    const client1 = manager.getClient(BASE_URL, { token: TOKEN_A });
    const client2 = manager.getClient(BASE_URL, { token: TOKEN_A });
    expect(client1).toBe(client2);
  });

  it("should return a new client when token changes", () => {
    const manager = new ConcreteClientManager();
    const client1 = manager.getClient(BASE_URL, { token: TOKEN_A });
    const client2 = manager.getClient(BASE_URL, { token: TOKEN_B });
    expect(client1).not.toBe(client2);
  });
});
