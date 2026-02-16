import { LollipopConfig } from "../../../../lollipop";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import { SessionToken } from "../../../../../types/SessionToken";
import { createSendLollipopLambdaClient } from "../index";
import * as lollipopFetchModule from "../../../../lollipop/utils/fetch";

const mockFetch = jest.fn();
jest.mock("../../../../lollipop/utils/fetch", () => ({
  lollipopFetch: jest.fn(() => mockFetch)
}));

const mockCreateClient = jest.fn();
jest.mock("../../../../../../definitions/pn/lollipop-lambda/client", () => ({
  createClient: jest.fn(input => mockCreateClient(input))
}));

describe("createSendLollipopLambdaClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should invoke `createClient` with input 'baseUrl', the result of `lollipopFetch` and a 'withDefaults' function", () => {
    const baseUrl = "https://localhost:3000";
    const sessionToken = "session-token-123" as SessionToken;
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

    const spiedOnLollipopFetch = jest.spyOn(
      lollipopFetchModule,
      "lollipopFetch"
    );

    createSendLollipopLambdaClient(baseUrl, sessionToken, keyInfo);

    expect(mockCreateClient.mock.calls.length).toBe(1);
    expect(mockCreateClient.mock.calls[0].length).toBe(1);

    const createClientParams = mockCreateClient.mock.calls[0][0];
    expect(createClientParams.baseUrl).toBe(baseUrl);
    expect(createClientParams.fetchApi).toBe(mockFetch);
    expect(createClientParams.withDefaults).toBeInstanceOf(Function);

    expect(spiedOnLollipopFetch.mock.calls.length).toBe(1);
    expect(spiedOnLollipopFetch.mock.calls[0].length).toBe(2);
    const nonceObj = spiedOnLollipopFetch.mock.calls[0][0] as LollipopConfig;
    expect(nonceObj.nonce).not.toBeUndefined();
    expect(spiedOnLollipopFetch.mock.calls[0][1]).toBe(keyInfo);
  });

  it("should create a `withDefaults` function that adds Bearer token to params", () => {
    const baseUrl = "https://localhost:3000";
    const sessionToken = "my-session-token" as SessionToken;
    const keyInfo: KeyInfo = {};

    createSendLollipopLambdaClient(baseUrl, sessionToken, keyInfo);

    const createClientParams = mockCreateClient.mock.calls[0][0];
    const withDefaults = createClientParams.withDefaults;

    const mockOp = jest.fn(params => params);
    const wrappedOp = withDefaults(mockOp);

    const inputParams = { someParam: "value" };
    wrappedOp(inputParams);

    expect(mockOp).toHaveBeenCalledWith({
      ...inputParams,
      Bearer: `Bearer ${sessionToken}`
    });
  });
});
