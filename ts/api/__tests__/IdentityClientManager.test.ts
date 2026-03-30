import { KeyInfo } from "../../features/lollipop/utils/crypto";
import { TestIdentityClientManager } from "../IdentityClientManager";

jest.mock("../../../definitions/backend/identity/client", () => ({
  createClient: jest.fn(() => ({ _type: "identity", id: Math.random() }))
}));

jest.mock("../../features/lollipop/utils/fetch", () => ({
  lollipopFetch: jest.fn(() => jest.fn())
}));

const BASE_URL = "http://example.com";
const TOKEN_A = "token-a";
const KEY_INFO_A: KeyInfo = {
  keyTag: "tag-a",
  publicKeyThumbprint: "thumbprint-a",
  publicKey: {
    crv: "P_256",
    kty: "EC",
    x: "nDbpq45jXUKfWxodyvec3F1e+r0oTSqhakbauVmB59Y=",
    y: "CtI6Cozk4O5OJ4Q6WyjiUw9/K6TyU0aDdssd25YHZxg="
  }
};
const KEY_INFO_B: KeyInfo = { ...KEY_INFO_A, keyTag: "tag-b" };

describe("IdentityClientManager", () => {
  it("should return the same client when token and keyInfo are unchanged", () => {
    const manager = new TestIdentityClientManager.IdentityClientManager!();
    const client1 = manager.getClient(BASE_URL, {
      token: TOKEN_A,
      keyInfo: KEY_INFO_A
    });
    const client2 = manager.getClient(BASE_URL, {
      token: TOKEN_A,
      keyInfo: KEY_INFO_A
    });
    expect(client1).toBe(client2);
  });

  it("should return a new client when keyInfo changes", () => {
    const manager = new TestIdentityClientManager.IdentityClientManager!();
    const client1 = manager.getClient(BASE_URL, {
      token: TOKEN_A,
      keyInfo: KEY_INFO_A
    });
    const client2 = manager.getClient(BASE_URL, {
      token: TOKEN_A,
      keyInfo: KEY_INFO_B
    });
    expect(client1).not.toBe(client2);
  });

  it("should return a new client when signBody changes", () => {
    const manager = new TestIdentityClientManager.IdentityClientManager!();
    const client1 = manager.getClient(BASE_URL, {
      token: TOKEN_A,
      keyInfo: KEY_INFO_A,
      signBody: false
    });
    const client2 = manager.getClient(BASE_URL, {
      token: TOKEN_A,
      keyInfo: KEY_INFO_A,
      signBody: true
    });
    expect(client1).not.toBe(client2);
  });
});
