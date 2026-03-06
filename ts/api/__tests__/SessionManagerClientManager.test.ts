import { KeyInfo } from "../../features/lollipop/utils/crypto";
import { TestSessionManagerClientManager } from "../SessionManagerClientManager";

jest.mock("../../../definitions/session_manager/client", () => ({
  createClient: jest.fn(() => ({ _type: "session_manager", id: Math.random() }))
}));

jest.mock("../../utils/fetch", () => ({
  defaultRetryingFetch: jest.fn(() => jest.fn())
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

describe("SessionManagerClientManager", () => {
  it("should return the same client when keyInfo changes (keyInfo not part of cache key)", () => {
    const manager =
      new TestSessionManagerClientManager.SessionManagerClientManager!();
    const client1 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_A);
    const client2 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_B);
    expect(client1).toBe(client2);
  });
});
