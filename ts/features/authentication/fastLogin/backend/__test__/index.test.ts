import { createClient } from "../../../../../../definitions/session_manager/client";
import { LollipopMethodEnum } from "../../../../../../definitions/lollipop/LollipopMethod";
import { defaultRetryingFetch } from "../../../../../utils/fetch";
import { LollipopConfig } from "../../../../lollipop";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import { lollipopFetch } from "../../../../lollipop/utils/fetch";
import {
  createFastLoginClient,
  performFastLogin,
  createNonceClient,
  performGetNonce
} from "../index";

jest.mock("../../../../../../definitions/session_manager/client", () => ({
  createClient: jest.fn()
}));

jest.mock("../../../../lollipop/utils/fetch", () => ({
  lollipopFetch: jest.fn()
}));

jest.mock("../../../../../utils/fetch", () => ({
  defaultRetryingFetch: jest.fn()
}));

describe("fastLogin backend client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a fast login client with lollipopFetch", () => {
    const fetchApi = jest.fn();
    (lollipopFetch as jest.Mock).mockReturnValue(fetchApi);

    const mockClient = { fastLogin: jest.fn() };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    const baseUrl = "https://test.fast-login.it";
    const keyInfo: KeyInfo = {
      keyTag: "test",
      publicKey: undefined,
      publicKeyThumbprint: "test"
    };

    const lollipopConfig: LollipopConfig = {
      nonce: "string",
      customContentToSign: {
        tos: "ASDFFA324SDFA==",
        sign: "DAFDEFAF323DSFA=="
      },
      signBody: false
    };

    const client = createFastLoginClient(baseUrl, keyInfo, lollipopConfig);

    expect(lollipopFetch).toHaveBeenCalledWith(
      lollipopConfig,
      keyInfo,
      1,
      9000
    );
    expect(createClient).toHaveBeenCalledWith({ baseUrl, fetchApi });
    expect(client).toBe(mockClient);
  });

  it("should call fastLogin with expected headers", async () => {
    const fastLogin = jest.fn();
    const client = { fastLogin } as any;

    await performFastLogin(client);

    expect(fastLogin).toHaveBeenCalledWith({
      "x-pagopa-lollipop-original-method": LollipopMethodEnum.POST,
      "x-pagopa-lollipop-original-url": "",
      "signature-input": "",
      signature: ""
    });
  });

  it("should create a nonce client with defaultRetryingFetch", () => {
    const fetchApi = jest.fn();
    (defaultRetryingFetch as jest.Mock).mockReturnValue(fetchApi);

    const mockClient = { lvGenerateNonce: jest.fn() };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    const baseUrl = "https://test.fast-login.it";
    const client = createNonceClient(baseUrl);

    expect(defaultRetryingFetch).toHaveBeenCalled();
    expect(createClient).toHaveBeenCalledWith({ baseUrl, fetchApi });
    expect(client).toBe(mockClient);
  });

  it("should call lvGenerateNonce on nonce client", async () => {
    const lvGenerateNonce = jest.fn();
    const client = { lvGenerateNonce } as any;

    await performGetNonce(client);

    expect(lvGenerateNonce).toHaveBeenCalledWith({});
  });

  it("should use default keyInfo if not provided", () => {
    const fetchApi = jest.fn();
    (lollipopFetch as jest.Mock).mockReturnValue(fetchApi);

    const mockClient = { fastLogin: jest.fn() };
    (createClient as jest.Mock).mockReturnValue(mockClient);

    const baseUrl = "https://test.fast-login.it";
    const lollipopConfig = { some: "config" };

    const client = createFastLoginClient(
      baseUrl,
      undefined as any,
      lollipopConfig as any
    );

    expect(lollipopFetch).toHaveBeenCalledWith(lollipopConfig, {}, 1, 9000);
    expect(createClient).toHaveBeenCalledWith({ baseUrl, fetchApi });
    expect(client).toBe(mockClient);
  });
});
