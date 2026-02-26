import { KeyInfo } from "../../features/lollipop/utils/crypto";
import { TestBackendClientManager } from "../BackendClientManager";

const exampleUrl = "http://www.example.com";
const exampleSessionToken = "mock-session-token";
const exampleKeyInfo: KeyInfo = {
  keyTag: "KEY_TAG",
  publicKeyThumbprint: "THUMBPRINT",
  publicKey: {
    crv: "P_256",
    kty: "EC",
    x: "nDbpq45jXUKfWxodyvec3F1e+r0oTSqhakbauVmB59Y=",
    y: "CtI6Cozk4O5OJ4Q6WyjiUw9/K6TyU0aDdssd25YHZxg="
  }
};

describe("BackendClientManager", () => {
  it.each([
    {
      description:
        "should return the same instance when token and keyInfo are the same",
      token1: exampleSessionToken,
      keyInfo1: exampleKeyInfo,
      token2: exampleSessionToken,
      keyInfo2: exampleKeyInfo
    },
    {
      description: "should return a new instance when token is different",
      token1: exampleSessionToken,
      keyInfo1: exampleKeyInfo,
      token2: "different-session-token",
      keyInfo2: exampleKeyInfo
    },
    {
      description: "should return a new instance when keyInfo is different",
      token1: exampleSessionToken,
      keyInfo1: exampleKeyInfo,
      token2: exampleSessionToken,
      keyInfo2: { ...exampleKeyInfo, keyTag: "DIFFERENT_KEY_TAG" }
    },
    {
      description:
        "should return a new instance when both token and keyInfo are different",
      token1: exampleSessionToken,
      keyInfo1: exampleKeyInfo,
      token2: "different-session-token",
      keyInfo2: { ...exampleKeyInfo, keyTag: "DIFFERENT_KEY_TAG" }
    }
  ])("$description", ({ token1, keyInfo1, token2, keyInfo2 }) => {
    const backendClientManager =
      new TestBackendClientManager.BackendClientManager!();
    const client1 = backendClientManager.getBackendClient(
      exampleUrl,
      token1,
      keyInfo1
    );
    const client2 = backendClientManager.getBackendClient(
      exampleUrl,
      token2,
      keyInfo2
    );

    if (client1.isSameClient(token2, keyInfo2)) {
      expect(client1).toBe(client2);
    } else {
      expect(client1).not.toBe(client2);
    }
  });
});
