import { PublicKey } from "@pagopa/io-react-native-crypto";
import { LoginUtilsError } from "@pagopa/io-react-native-login-utils";
import CookieManager from "@react-native-cookies/cookies";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import URLParse from "url-parse";

import { apiUrlPrefix } from "../../../../config";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { SpidIdp } from "../../../../utils/idps";
import { setOneIdentityEnv } from "../../../authentication/common/store/actions/loginConfig";
import { ONE_IDENTITY_ENVS } from "../../../authentication/common/store/reducers/loginConfig";
import { AUTH_LEVELS, AuthLevel } from "../../../authentication/common/utils";
import {
  createRetriableFetch,
  FetchResponse
} from "../../../authentication/common/utils/fetch";
import { isFastLoginEnabledSelector } from "../../../authentication/fastLogin/store/selectors";
import { lollipopSetEphemeralPublicKey } from "../../store/actions/lollipop";
import { toBase64EncodedThumbprint } from "../../utils/crypto";
import {
  getRedirectsAndVerifySaml,
  lollipopSamlVerify
} from "../../utils/login";
import { useOneIdentityLoginSource } from "../useOneIdentityLoginSource";

jest.mock("../../../authentication/common/utils/fetch", () => {
  const mockFetch = jest.fn();
  return {
    ...jest.requireActual("../../../authentication/common/utils/fetch"),
    createRetriableFetch: jest.fn(() => mockFetch)
  };
});
const mockRetriableFetch = createRetriableFetch() as jest.Mock;

const mockPublicKey = { kty: "EC" } as unknown as PublicKey;
const mockHandleRegenerateEphemeralKey = jest.fn();

jest.mock("../..", () => ({
  ...jest.requireActual("../.."),
  handleRegenerateEphemeralKey: () => mockHandleRegenerateEphemeralKey()
}));

jest.mock("../../utils/login", () => ({
  ...jest.requireActual("../../utils/login"),
  getRedirectsAndVerifySaml: jest.fn(),
  lollipopSamlVerify: jest.fn()
}));

jest.mock("@react-native-cookies/cookies", () => ({
  removeSessionCookies: jest.fn()
}));

jest.mock("../../../authentication/fastLogin/store/selectors", () => ({
  isFastLoginEnabledSelector: jest.fn(() => false)
}));

const mockIdp = { id: "idp-id", name: "idp-name" } as unknown as SpidIdp;
const reserveResponse = {
  authorization_endpoint: "https://one-identity.example.com/oidc/authorize",
  client_id: "client-id",
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
  followRedirectsNatively?: boolean;
  minAuthLevel?: AuthLevel;
  store?: ReturnType<typeof createTestStore>;
}

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any);
};

const setupTest = ({
  followRedirectsNatively,
  minAuthLevel = AUTH_LEVELS.L2,
  store = createTestStore()
}: SetupOptions = {}) => {
  const onFailure = jest.fn();

  const utils = renderHook(
    () =>
      useOneIdentityLoginSource({
        followRedirectsNatively,
        idpId: mockIdp.id,
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
    mockRetriableFetch.mockResolvedValue(successResponse(200, reserveResponse));

    const { result } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe(
        "one-identity-authorize"
      );
    });

    expect(mockRetriableFetch).toHaveBeenCalledWith(
      `${apiUrlPrefix}/api/auth/v1/reserve`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          env: "PROD",
          min_auth_level: "SpidL2",
          lollipop_pub_key: "eyJrdHkiOiJFQyJ9",
          lollipop_hash_algo: "sha256",
          login_type: "LEGACY"
        })
      })
    );

    const { webviewSource } = result.current.loginSourceState as {
      status: "one-identity-authorize";
      webviewSource: { headers?: Record<string, string>; uri: string };
    };
    const authorizeUrl = new URLParse(webviewSource.uri, true);

    expect(authorizeUrl.origin).toBe("https://one-identity.example.com");
    expect(authorizeUrl.pathname).toBe("/oidc/authorize");
    expect(authorizeUrl.query.client_id).toBe(reserveResponse.client_id);
    expect(
      webviewSource.headers?.["x-pagopa-lollipop-assertion-ref"]
    ).toContain(toBase64EncodedThumbprint(mockPublicKey));
  });

  it("should expose a failure loginSourceState on HTTP error", async () => {
    mockRetriableFetch.mockResolvedValue(successResponse(500, {}));

    const { result, onFailure } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe("failure");
    });
    expect(onFailure).toHaveBeenCalled();
  });

  it("should trigger a new reserve request when generateLoginSource is called after a successful response", async () => {
    mockRetriableFetch.mockResolvedValue(successResponse(200, reserveResponse));

    const { result } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe(
        "one-identity-authorize"
      );
      expect(mockRetriableFetch).toHaveBeenCalledTimes(1);
    });

    act(() => {
      void result.current.generateLoginSource();
    });

    expect(result.current.loginSourceState.status).toBe("reserving-public-key");

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledTimes(2);
      expect(result.current.loginSourceState.status).toBe(
        "one-identity-authorize"
      );
    });
  });

  it("should abort a still pending reserve request when generateLoginSource is called before it resolves", async () => {
    // eslint-disable-next-line functional/no-let
    let resolveFirstFetch: (value: FetchResponse) => void = () => undefined;

    mockRetriableFetch.mockImplementationOnce(
      () =>
        new Promise<FetchResponse>(resolve => {
          resolveFirstFetch = resolve;
        })
    );

    mockRetriableFetch.mockResolvedValueOnce(
      successResponse(200, reserveResponse)
    );

    const { result } = setupTest();

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledTimes(1);
    });

    const [, fetchOptions] = mockRetriableFetch.mock.lastCall as [
      string,
      RequestInit
    ];
    const firstFetchSignal = fetchOptions.signal as AbortSignal;

    expect(firstFetchSignal.aborted).toBe(false);

    act(() => {
      void result.current.generateLoginSource();
    });

    expect(firstFetchSignal.aborted).toBe(true);

    resolveFirstFetch(successResponse(200, reserveResponse));

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledTimes(2);
      expect(result.current.loginSourceState.status).toBe(
        "one-identity-authorize"
      );
    });
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

    expect(mockRetriableFetch).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledWith(
      "Unable to generate ephemeral public key"
    );
  });

  it("should send LV as login_type in the reserve body when fast login is enabled", async () => {
    jest.mocked(isFastLoginEnabledSelector).mockReturnValue(true);
    mockRetriableFetch.mockResolvedValue(successResponse(200, reserveResponse));

    setupTest();

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledWith(
        `${apiUrlPrefix}/api/auth/v1/reserve`,
        expect.objectContaining({
          body: JSON.stringify({
            env: "PROD",
            min_auth_level: "SpidL2",
            lollipop_pub_key: "eyJrdHkiOiJFQyJ9",
            lollipop_hash_algo: "sha256",
            login_type: "LV"
          })
        })
      );
    });
  });

  it("should use the configured OneIdentity environment in the reserve request body", async () => {
    mockRetriableFetch.mockResolvedValue(successResponse(200, reserveResponse));

    const store = createTestStore();
    store.dispatch(setOneIdentityEnv(ONE_IDENTITY_ENVS.UAT));

    setupTest({ store });

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledWith(
        `${apiUrlPrefix}/api/auth/v1/reserve`,
        expect.objectContaining({
          body: JSON.stringify({
            env: "UAT",
            min_auth_level: "SpidL2",
            lollipop_pub_key: "eyJrdHkiOiJFQyJ9",
            lollipop_hash_algo: "sha256",
            login_type: "LEGACY"
          })
        })
      );
    });
  });

  describe("shouldBlockUrlNavigationWhileCheckingLollipop", () => {
    const setupReadyState = async () => {
      mockRetriableFetch.mockResolvedValue(
        successResponse(200, reserveResponse)
      );

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

  describe("followRedirectsNatively", () => {
    const ssoUrl = "https://idp.example.com/sso?SAMLRequest=encoded-request";

    beforeEach(() => {
      mockRetriableFetch.mockResolvedValue(
        successResponse(200, reserveResponse)
      );
      jest.mocked(CookieManager.removeSessionCookies).mockResolvedValue(true);
    });

    it("should not follow the redirects natively when disabled", async () => {
      const { result } = setupTest({ followRedirectsNatively: false });

      await waitFor(() => {
        expect(result.current.loginSourceState.status).toBe(
          "one-identity-authorize"
        );
      });
      expect(getRedirectsAndVerifySaml).not.toHaveBeenCalled();
    });

    it("should follow the /authorize redirects natively and expose the verified IDP SSO URL", async () => {
      jest.mocked(getRedirectsAndVerifySaml).mockResolvedValue(ssoUrl);

      const { result, onFailure } = setupTest({
        followRedirectsNatively: true
      });

      await waitFor(() => {
        expect(result.current.loginSourceState).toEqual({
          status: "assertion-ref-verified",
          webviewSource: { uri: ssoUrl }
        });
      });

      const [authorizeUrl, headers, publicKey] = jest.mocked(
        getRedirectsAndVerifySaml
      ).mock.lastCall!;
      const parsedAuthorizeUrl = new URLParse(authorizeUrl, true);

      expect(parsedAuthorizeUrl.origin).toBe(
        "https://one-identity.example.com"
      );
      expect(parsedAuthorizeUrl.pathname).toBe("/oidc/authorize");
      expect(parsedAuthorizeUrl.query.client_id).toBe(
        reserveResponse.client_id
      );
      expect(headers["x-pagopa-lollipop-assertion-ref"]).toContain(
        toBase64EncodedThumbprint(mockPublicKey)
      );
      expect(publicKey).toBe(mockPublicKey);
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should expose the following-redirects status while the redirects are pending", async () => {
      jest
        .mocked(getRedirectsAndVerifySaml)
        .mockReturnValue(new Promise(() => undefined));

      const { result } = setupTest({ followRedirectsNatively: true });

      await waitFor(() => {
        expect(result.current.loginSourceState.status).toBe(
          "following-redirects"
        );
      });
    });

    it.each([
      {
        name: "a native error with HTTP status",
        error: {
          userInfo: { error: "REDIRECTING_ERROR", statusCode: 500 },
          code: "NativeRedirectError"
        } as unknown as LoginUtilsError,
        expectedReason:
          "Native redirects failed with REDIRECTING_ERROR (HTTP 500)"
      },
      {
        name: "a native error without HTTP status",
        error: {
          userInfo: { error: "REDIRECTING_ERROR" },
          code: "NativeRedirectError"
        } as unknown as LoginUtilsError,
        expectedReason: "Native redirects failed with REDIRECTING_ERROR"
      },
      {
        name: "a SAML verification error",
        error: new Error(
          "Mismatch between local and remote ID parameter content"
        ),
        expectedReason: "Mismatch between local and remote ID parameter content"
      },
      {
        name: "an unknown error",
        error: "unexpected",
        expectedReason: "Native redirects failed with an unknown error"
      }
    ])(
      "should fail with a descriptive reason on $name",
      async ({ error, expectedReason }) => {
        jest.mocked(getRedirectsAndVerifySaml).mockRejectedValue(error);

        const { result, onFailure } = setupTest({
          followRedirectsNatively: true
        });

        await waitFor(() => {
          expect(result.current.loginSourceState).toEqual({
            status: "failure",
            error: expectedReason
          });
        });
        expect(onFailure).toHaveBeenCalledWith(expectedReason);
      }
    );

    it.each([
      { platform: "android" as const, shouldRemoveCookies: true },
      { platform: "ios" as const, shouldRemoveCookies: false }
    ])(
      "should remove session cookies before the redirects only when needed on $platform",
      async ({ platform, shouldRemoveCookies }) => {
        jest.replaceProperty(Platform, "OS", platform);
        jest.mocked(getRedirectsAndVerifySaml).mockResolvedValue(ssoUrl);

        const { result } = setupTest({ followRedirectsNatively: true });

        await waitFor(() => {
          expect(result.current.loginSourceState.status).toBe(
            "assertion-ref-verified"
          );
        });
        expect(CookieManager.removeSessionCookies).toHaveBeenCalledTimes(
          shouldRemoveCookies ? 1 : 0
        );
      }
    );

    it("should fail without following the redirects when session cookies cannot be removed on android", async () => {
      jest.replaceProperty(Platform, "OS", "android");
      jest
        .mocked(CookieManager.removeSessionCookies)
        .mockRejectedValue(new Error("Unable to remove cookies"));

      const { result, onFailure } = setupTest({
        followRedirectsNatively: true
      });

      await waitFor(() => {
        expect(onFailure).toHaveBeenCalledWith("Unable to remove cookies");
      });
      expect(result.current.loginSourceState.status).toBe("failure");
      expect(getRedirectsAndVerifySaml).not.toHaveBeenCalled();
    });

    it("should discard the result of a stale native redirects flow when generateLoginSource is called again", async () => {
      const staleSsoUrl =
        "https://idp.example.com/sso?SAMLRequest=stale-request";
      // eslint-disable-next-line functional/no-let
      let resolveStaleRedirects: (url: string) => void = () => undefined;

      jest
        .mocked(getRedirectsAndVerifySaml)
        .mockImplementationOnce(
          () =>
            new Promise<string>(resolve => {
              resolveStaleRedirects = resolve;
            })
        )
        .mockResolvedValueOnce(ssoUrl);

      const { result } = setupTest({ followRedirectsNatively: true });

      await waitFor(() => {
        expect(getRedirectsAndVerifySaml).toHaveBeenCalledTimes(1);
      });

      act(() => {
        void result.current.generateLoginSource();
      });

      await waitFor(() => {
        expect(result.current.loginSourceState).toEqual({
          status: "assertion-ref-verified",
          webviewSource: { uri: ssoUrl }
        });
      });

      await act(async () => {
        resolveStaleRedirects(staleSsoUrl);
      });

      expect(result.current.loginSourceState).toEqual({
        status: "assertion-ref-verified",
        webviewSource: { uri: ssoUrl }
      });
    });

    it("should not fail when the native redirects flow rejects after unmount", async () => {
      // eslint-disable-next-line functional/no-let
      let rejectRedirects: (error: Error) => void = () => undefined;

      jest.mocked(getRedirectsAndVerifySaml).mockImplementation(
        () =>
          new Promise<string>((_, reject) => {
            rejectRedirects = reject;
          })
      );

      const { unmount, onFailure } = setupTest({
        followRedirectsNatively: true
      });

      await waitFor(() => {
        expect(getRedirectsAndVerifySaml).toHaveBeenCalledTimes(1);
      });

      unmount();
      await act(async () => {
        rejectRedirects(new Error("Missing Redirects"));
      });

      expect(onFailure).not.toHaveBeenCalled();
    });
  });
});
