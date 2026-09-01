import { PublicKey } from "@pagopa/io-react-native-crypto";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import URLParse from "url-parse";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { SpidIdp } from "../../../../utils/idps";
import { setOneIdentityEnv } from "../../../authentication/common/store/actions/loginConfig";
import {
  createRetriableFetch,
  FetchResponse
} from "../../../authentication/common/utils/fetch";
import { isFastLoginEnabledSelector } from "../../../authentication/fastLogin/store/selectors";
import { SpidLevel } from "../../../authentication/login/cie/utils";
import { lollipopSetEphemeralPublicKey } from "../../store/actions/lollipop";
import { toBase64EncodedThumbprint } from "../../utils/crypto";
import { lollipopSamlVerify } from "../../utils/login";
import { useOneIdentityLoginSource } from "../useOneIdentityLoginSource";

jest.mock("../../../authentication/common/utils/fetch", () => {
  const mockFetch = jest.fn();
  return {
    ...jest.requireActual("../../../authentication/common/utils/fetch"),
    createRetriableFetch: jest.fn(() => mockFetch)
  };
});
const mockFetchReserve = createRetriableFetch() as jest.Mock;

const mockPublicKey = { kty: "EC" } as unknown as PublicKey;
const mockHandleRegenerateEphemeralKey = jest.fn();

jest.mock("../..", () => ({
  ...jest.requireActual("../.."),
  handleRegenerateEphemeralKey: () => mockHandleRegenerateEphemeralKey()
}));

jest.mock("../../utils/login", () => ({
  ...jest.requireActual("../../utils/login"),
  lollipopSamlVerify: jest.fn()
}));

jest.mock("../../../authentication/fastLogin/store/selectors", () => ({
  isFastLoginEnabledSelector: jest.fn(() => false)
}));

const mockIdp = { id: "idp-id", name: "idp-name" } as unknown as SpidIdp;
const reserveResponse = {
  client_id: "client-id",
  issuer: "https://one-identity.example.com/",
  nonce: "nonce-value",
  redirect_uri: "https://redirect.example.com/callback",
  state: "state-value"
};

const successResponse = (status: number, body: unknown): FetchResponse => ({
  type: "success",
  response: {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  } as unknown as Response
});

interface SetupOptions {
  minAuthLevel?: SpidLevel;
  store?: ReturnType<typeof createTestStore>;
}

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any);
};

const setupTest = ({
  minAuthLevel = "SpidL2",
  store = createTestStore()
}: SetupOptions = {}) => {
  const onFailure = jest.fn();

  const utils = renderHook(
    () =>
      useOneIdentityLoginSource({
        idp: mockIdp,
        onFailure,
        minAuthLevel
      }),
    {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    }
  );

  return { ...utils, store, onFailure };
};

describe("useOneIdentityLoginSource", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(isFastLoginEnabledSelector).mockReturnValue(false);
    mockHandleRegenerateEphemeralKey.mockResolvedValue(mockPublicKey);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should call POST /reserve and build the OneIdentity /authorize on success", async () => {
    mockFetchReserve.mockResolvedValue(successResponse(200, reserveResponse));

    const { result } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe(
        "one-identity-authorize"
      );
    });

    expect(mockFetchReserve).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/auth/v2/reserve?env=PROD&minAuthLevel=SpidL2"
      ),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-pagopa-login-type": "LEGACY",
          "x-pagopa-lollipop-pub-key": "eyJrdHkiOiJFQyJ9"
        })
      })
    );

    const { webviewSource } = result.current.loginSourceState as {
      status: "one-identity-authorize";
      webviewSource: { headers?: Record<string, string>; uri: string };
    };
    const authorizeUrl = new URLParse(webviewSource.uri, true);

    expect(authorizeUrl.origin).toBe("https://one-identity.example.com");
    expect(authorizeUrl.query.client_id).toBe(reserveResponse.client_id);
    expect(webviewSource.headers?.["assertion-ref"]).toContain(
      toBase64EncodedThumbprint(mockPublicKey)
    );
  });

  it("should expose a failure loginSourceState on HTTP error", async () => {
    mockFetchReserve.mockResolvedValue(successResponse(500, {}));

    const { result, onFailure } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe("failure");
    });
    expect(onFailure).toHaveBeenCalled();
  });

  it("should fail if ephemeral key generation fails", async () => {
    mockHandleRegenerateEphemeralKey.mockResolvedValueOnce(undefined);

    const { result, onFailure } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState).toEqual({
        status: "failure",
        error: "Unable to generate ephemeral public key"
      });
    });

    expect(mockFetchReserve).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledWith(
      "Unable to generate ephemeral public key"
    );
  });

  it("should send LV as login-type header when fast login is enabled", async () => {
    jest.mocked(isFastLoginEnabledSelector).mockReturnValue(true);
    mockFetchReserve.mockResolvedValue(successResponse(200, reserveResponse));

    setupTest();

    await waitFor(() => {
      expect(mockFetchReserve).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-pagopa-login-type": "LV"
          })
        })
      );
    });
  });

  it("should use the configured OneIdentity environment in the reserve URL", async () => {
    mockFetchReserve.mockResolvedValue(successResponse(200, reserveResponse));

    const store = createTestStore();
    store.dispatch(setOneIdentityEnv("uat"));

    setupTest({ store });

    await waitFor(() => {
      expect(mockFetchReserve).toHaveBeenCalledWith(
        expect.stringContaining("env=UAT"),
        expect.any(Object)
      );
    });
  });

  describe("shouldBlockUrlNavigationWhileCheckingLollipop", () => {
    const setupReadyState = async () => {
      mockFetchReserve.mockResolvedValue(successResponse(200, reserveResponse));

      const { store, result, onFailure } = setupTest();
      store.dispatch(
        lollipopSetEphemeralPublicKey({ publicKey: mockPublicKey })
      );

      await waitFor(() => {
        expect(result.current.loginSourceState.status).toBe(
          "one-identity-authorize"
        );
      });

      return { result, store, onFailure };
    };

    it("should return false when the URL has no SAMLRequest query param", async () => {
      const { result } = await setupReadyState();

      // eslint-disable-next-line functional/no-let
      let blocked = true;
      act(() => {
        blocked = result.current.shouldBlockUrlNavigationWhileCheckingLollipop(
          "https://idp.example.com/sso"
        );
      });

      expect(blocked).toBe(false);
    });

    it("should block navigation and expose the SAMLRequest URL as verified when LolliPOP succeeds", async () => {
      jest
        .mocked(lollipopSamlVerify)
        .mockImplementation((_req, _key, onSuccess) => onSuccess());

      const { result, onFailure } = await setupReadyState();
      const url = "https://idp.example.com/sso?SAMLRequest=encoded-request";

      // eslint-disable-next-line functional/no-let
      let blocked = false;
      act(() => {
        blocked =
          result.current.shouldBlockUrlNavigationWhileCheckingLollipop(url);
      });

      expect(blocked).toBe(true);
      await waitFor(() => {
        expect(result.current.loginSourceState).toEqual({
          status: "assertion-ref-verified",
          webviewSource: { uri: url }
        });
      });
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should call onFailure with the reason when LolliPOP verification fails", async () => {
      jest
        .mocked(lollipopSamlVerify)
        .mockImplementation((_req, _key, _onSuccess, onLollipopFailure) =>
          onLollipopFailure("mismatch")
        );

      const { result, onFailure } = await setupReadyState();
      const url = "https://idp.example.com/sso?SAMLRequest=encoded-request";

      // eslint-disable-next-line functional/no-let
      let blocked = false;
      act(() => {
        blocked =
          result.current.shouldBlockUrlNavigationWhileCheckingLollipop(url);
      });

      expect(blocked).toBe(true);
      await waitFor(() => {
        expect(onFailure).toHaveBeenCalledWith("mismatch");
      });
    });
  });
});
