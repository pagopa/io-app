import * as sendAARClient from "../../../../../../definitions/pn/aar/client";
import { LollipopConfig } from "../../../../lollipop";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import * as lollipopFetch from "../../../../lollipop/utils/fetch";
import { createSendAARClientWithLollipop } from "../client";
describe("createSendAARClientWithLollipop", () => {
  it("should invoke `createClient` with input 'baseUrl', 'keyInfo' and the result of `lollipopFetch`", () => {
    const mockFetch = jest.fn();
    const spyLollipopFetch = jest
      .spyOn(lollipopFetch, "lollipopFetch")
      .mockImplementation(
        (_lollipoConfig, _keyInfo, _maxRetries, _timeout) => mockFetch
      );
    const mockCreateClient = jest.fn();
    jest
      .spyOn(sendAARClient, "createClient")
      .mockImplementation(input => mockCreateClient(input));

    const baseUrl = "https://localhost:3000";
    const keyInfo: KeyInfo = {
      keyTag: "aTag",
      publicKey: {
        kty: "RSA",
        alg: "anAlg",
        e: "asd",
        n: "dsa"
      },
      publicKeyThumbprint: "qwe"
    };
    createSendAARClientWithLollipop(baseUrl, keyInfo);

    expect(mockCreateClient.mock.calls.length).toBe(1);
    expect(mockCreateClient.mock.calls[0].length).toBe(1);
    expect(mockCreateClient.mock.calls[0][0]).toEqual({
      baseUrl,
      fetchApi: mockFetch
    });
    expect(spyLollipopFetch.mock.calls.length).toBe(1);
    expect(spyLollipopFetch.mock.calls[0].length).toBe(2);
    const nonceObj = spyLollipopFetch.mock.calls[0][0] as LollipopConfig;
    expect(nonceObj.nonce).not.toBeUndefined();
    expect(spyLollipopFetch.mock.calls[0][1]).toEqual(keyInfo);
  });
});
