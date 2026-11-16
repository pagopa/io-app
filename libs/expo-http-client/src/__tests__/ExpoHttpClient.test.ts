import type {
  HttpCallConfig,
  HttpClientResponse
} from "../ExpoHttpClient.types";

jest.mock("../ExpoHttpClientModule", () => {
  const nativeModuleMock = jest.requireActual("../../mocks/ExpoHttpClient");
  return {
    __esModule: true,
    default: Object.fromEntries(
      Object.entries(nativeModuleMock).map(([name, implementation]) => [
        name,
        jest.fn(implementation as (...args: Array<unknown>) => unknown)
      ])
    )
  };
});

import * as ExpoHttpClient from "../ExpoHttpClient";
import ExpoHttpClientModule from "../ExpoHttpClientModule";

const nativeModule = jest.mocked(ExpoHttpClientModule!);

const config: HttpCallConfig = {
  verb: "post",
  url: "https://example.com/login",
  headers: { accept: "text/html" },
  body: { username: "user" },
  followRedirects: false,
  requestId: "request-id",
  timeoutMilliseconds: 5000
};

describe("ExpoHttpClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each<{ name: string; response: HttpClientResponse }>([
    {
      name: "success",
      response: {
        type: "success",
        status: 200,
        body: "<html />",
        headers: { "set-cookie": "a=b" }
      }
    },
    {
      name: "HTTP failure",
      response: { type: "failure", code: 404, message: "", headers: {} }
    },
    {
      name: "non-HTTP failure",
      response: { type: "failure", code: 900, message: "Timeout", headers: {} }
    }
  ])(
    "nativeRequest forwards the config and resolves with the $name response",
    async ({ response }) => {
      nativeModule.nativeRequest.mockResolvedValueOnce(response);

      await expect(ExpoHttpClient.nativeRequest(config)).resolves.toEqual(
        response
      );
      expect(nativeModule.nativeRequest).toHaveBeenCalledWith(config);
    }
  );

  it("nativeRequest propagates native rejections", async () => {
    const error = new Error("Argument conversion failed");
    nativeModule.nativeRequest.mockRejectedValueOnce(error);

    await expect(ExpoHttpClient.nativeRequest(config)).rejects.toBe(error);
  });

  test.each([
    {
      name: "setCookie",
      call: () => ExpoHttpClient.setCookie("https://a.it", "/", "n", "v"),
      native: "setCookieForDomain",
      args: ["https://a.it", "/", "n", "v"]
    },
    {
      name: "removeAllCookiesForDomain",
      call: () => ExpoHttpClient.removeAllCookiesForDomain("https://a.it"),
      native: "removeAllCookiesForDomain",
      args: ["https://a.it"]
    },
    {
      name: "cancelRequestWithId",
      call: () => ExpoHttpClient.cancelRequestWithId("request-id"),
      native: "cancelRequestWithId",
      args: ["request-id"]
    },
    {
      name: "cancelAllRunningRequests",
      call: () => ExpoHttpClient.cancelAllRunningRequests(),
      native: "cancelAllRunningRequests",
      args: []
    },
    {
      name: "deallocate",
      call: () => ExpoHttpClient.deallocate(),
      native: "deallocate",
      args: []
    }
  ] as const)(
    "$name delegates to the native module",
    ({ call, native, args }) => {
      call();

      expect(nativeModule[native]).toHaveBeenCalledWith(...args);
    }
  );
});

describe("ExpoHttpClient on an unsupported platform", () => {
  const loadClient = (): typeof ExpoHttpClient => {
    jest.resetModules();
    jest.doMock("../ExpoHttpClientModule", () => ({
      __esModule: true,
      default: undefined
    }));
    return jest.requireActual("../ExpoHttpClient");
  };

  it("nativeRequest rejects", async () => {
    await expect(loadClient().nativeRequest(config)).rejects.toThrow(
      "ExpoHttpClient is only available on iOS and Android."
    );
  });

  test.each([
    "setCookie",
    "removeAllCookiesForDomain",
    "cancelRequestWithId",
    "cancelAllRunningRequests",
    "deallocate"
  ] as const)("%s throws", name => {
    const client = loadClient();
    const call = client[name] as (...args: Array<string>) => void;

    expect(() => call("a", "b", "c", "d")).toThrow(
      "ExpoHttpClient is only available on iOS and Android."
    );
  });
});
