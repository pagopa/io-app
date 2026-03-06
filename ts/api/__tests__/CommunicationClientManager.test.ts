import { KeyInfo } from "../../features/lollipop/utils/crypto";
import { TestCommunicationClientManager } from "../CommunicationClientManager";

jest.mock("../../../definitions/backend/communication/client", () => ({
  createClient: jest.fn(() => ({ _type: "communication", id: Math.random() }))
}));

jest.mock("../../features/lollipop/utils/fetch", () => ({
  lollipopFetch: jest.fn(() => jest.fn())
}));

const BASE_URL = "http://example.com";
const TOKEN_A = "token-a";
const TOKEN_B = "token-b";
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

describe("CommunicationClientManager", () => {
  it("should return the same client when token and keyInfo are unchanged", () => {
    const manager =
      new TestCommunicationClientManager.CommunicationClientManager!();
    const client1 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_A);
    const client2 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_A);
    expect(client1).toBe(client2);
  });

  it("should return a new client when the token changes", () => {
    const manager =
      new TestCommunicationClientManager.CommunicationClientManager!();
    const client1 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_A);
    const client2 = manager.getClient(BASE_URL, TOKEN_B, KEY_INFO_A);
    expect(client1).not.toBe(client2);
  });

  it("should return a new client when keyInfo changes", () => {
    const manager =
      new TestCommunicationClientManager.CommunicationClientManager!();
    const client1 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_A);
    const client2 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_B);
    expect(client1).not.toBe(client2);
  });

  it("should return a new client when both token and keyInfo change", () => {
    const manager =
      new TestCommunicationClientManager.CommunicationClientManager!();
    const client1 = manager.getClient(BASE_URL, TOKEN_A, KEY_INFO_A);
    const client2 = manager.getClient(BASE_URL, TOKEN_B, KEY_INFO_B);
    expect(client1).not.toBe(client2);
  });
});
