import { PublicKey } from "@pagopa/io-react-native-crypto";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { err, ok } from "neverthrow";
import { Provider } from "react-redux";
import { createStore } from "redux";
import URLParse from "url-parse";

import { apiUrlPrefix } from "../../../../config";
import { applicationChangeState } from "../../../../store/actions/application";
import { setProfileHashedFiscalCode } from "../../../../store/actions/crossSessions";
import { appReducer } from "../../../../store/reducers";
import { hashedProfileFiscalCodeSelector } from "../../../../store/reducers/crossSessions";
import { SpidIdp } from "../../../../utils/idps";
import * as authenticationAnalytics from "../../../authentication/common/analytics";
import { setOneIdentityEnv } from "../../../authentication/common/store/actions/loginConfig";
import { ONE_IDENTITY_ENVS } from "../../../authentication/common/store/reducers/loginConfig";
import {
  AUTH_LEVELS,
  AuthLevel,
  LOGIN_TYPES
} from "../../../authentication/common/utils";
import {
  createRetriableFetch,
  FetchResponse
} from "../../../authentication/common/utils/fetch";
import { LoginType } from "../../../authentication/common/utils/index";
import { isFastLoginEnabledSelector } from "../../../authentication/fastLogin/store/selectors";
import { lollipopSetEphemeralPublicKey } from "../../store/actions/lollipop";
import { toBase64EncodedThumbprint } from "../../utils/crypto";
import {
  followNativeRedirectsAndVerifySaml,
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

type RedirectsResult = Awaited<
  ReturnType<typeof followNativeRedirectsAndVerifySaml>
>;

const mockPublicKey = { kty: "EC" } as unknown as PublicKey;
const mockHandleRegenerateEphemeralKey = jest.fn();

jest.mock("../..", () => ({
  ...jest.requireActual("../.."),
  handleRegenerateEphemeralKey: () => mockHandleRegenerateEphemeralKey()
}));

jest.mock("../../utils/login", () => ({
  ...jest.requireActual("../../utils/login"),
  followNativeRedirectsAndVerifySaml: jest.fn(),
  lollipopSamlVerify: jest.fn()
}));

jest.mock("../../../authentication/fastLogin/store/selectors", () => ({
  isFastLoginEnabledSelector: jest.fn(() => false)
}));

const mockAppVersion = "1.2.3";
// eslint-disable-next-line functional/no-let
let mockIsLocalEnv = false;

// A getter defined through `defineProperty` is needed to change the value per
// test: one declared next to the spread would be evaluated only once.
jest.mock("../../../../utils/environment", () =>
  Object.defineProperty(
    { ...jest.requireActual("../../../../utils/environment") },
    "isLocalEnv",
    { get: () => mockIsLocalEnv }
  )
);

jest.mock("../../../../utils/appVersion", () => ({
  ...jest.requireActual("../../../../utils/appVersion"),
  getAppVersion: () => mockAppVersion
}));

const mockIdp = { id: "idp-id", name: "idp-name" } as unknown as SpidIdp;
const reserveResponse = {
  acr_values: "https://www.spid.gov.it/SpidL2",
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

const abortedResponse: FetchResponse = {
  type: "failure",
  reason: "aborted",
  message: "The request was aborted"
};

interface SetupOptions {
  flow?: LoginType;
  followRedirectsNatively?: boolean;
  minAuthLevel?: AuthLevel;
  store?: ReturnType<typeof createTestStore>;
}

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any);
};

const setupTest = ({
  flow = LOGIN_TYPES.AUTH,
  followRedirectsNatively,
  minAuthLevel = AUTH_LEVELS.L2,
  store = createTestStore()
}: SetupOptions = {}) => {
  const onFailure = jest.fn();

  const utils = renderHook(
    () =>
      useOneIdentityLoginSource({
        flow,
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
    mockIsLocalEnv = false;
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
    expect(authorizeUrl.query.acr_values).toBe(reserveResponse.acr_values);
    expect(authorizeUrl.query.minAuthLevel).toBeUndefined();
    expect(
      webviewSource.headers?.["x-pagopa-lollipop-assertion-ref"]
    ).toContain(toBase64EncodedThumbprint(mockPublicKey));
  });

  describe("x-pagopa-app-version /authorize header", () => {
    const appVersionHeader = "x-pagopa-app-version";

    it.each([
      {
        name: "should be sent to the WebView in local env",
        followRedirectsNatively: false,
        isLocalEnv: true,
        expectedAppVersion: mockAppVersion
      },
      {
        name: "should not be sent to the WebView outside local env",
        followRedirectsNatively: false,
        isLocalEnv: false,
        expectedAppVersion: undefined
      },
      {
        name: "should be sent to the native redirects in local env",
        followRedirectsNatively: true,
        isLocalEnv: true,
        expectedAppVersion: mockAppVersion
      },
      {
        name: "should not be sent to the native redirects outside local env",
        followRedirectsNatively: true,
        isLocalEnv: false,
        expectedAppVersion: undefined
      }
    ])(
      "$name",
      async ({ followRedirectsNatively, isLocalEnv, expectedAppVersion }) => {
        mockIsLocalEnv = isLocalEnv;
        mockRetriableFetch.mockResolvedValue(
          successResponse(200, reserveResponse)
        );
        jest
          .mocked(followNativeRedirectsAndVerifySaml)
          .mockResolvedValue(ok("https://idp.example.com/sso?SAMLRequest=abc"));

        const { result } = setupTest({ followRedirectsNatively });

        await waitFor(() => {
          expect(result.current.loginSourceState.status).toBe(
            followRedirectsNatively
              ? "assertion-ref-verified"
              : "one-identity-authorize"
          );
        });

        const headers: Record<string, string | undefined> | undefined =
          followRedirectsNatively
            ? jest.mocked(followNativeRedirectsAndVerifySaml).mock.lastCall?.[1]
            : (
                result.current.loginSourceState as {
                  webviewSource: { headers?: Record<string, string> };
                }
              ).webviewSource.headers;

        expect(headers).toBeDefined();
        expect(headers?.[appVersionHeader]).toBe(expectedAppVersion);
        expect(headers?.["x-pagopa-lollipop-assertion-ref"]).toContain(
          toBase64EncodedThumbprint(mockPublicKey)
        );
      }
    );
  });

  it("should expose a failure loginSourceState on HTTP error", async () => {
    mockRetriableFetch.mockResolvedValue(successResponse(500, {}));

    const { result, onFailure } = setupTest();

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe("failure");
    });
    expect(onFailure).toHaveBeenCalledWith({
      reason: "Unexpected HTTP status 500",
      url: `${apiUrlPrefix}/api/auth/v1/reserve`
    });
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

  it("should not fail when the reserve request is aborted by unmount", async () => {
    // eslint-disable-next-line functional/no-let
    let resolveFetch: (value: FetchResponse) => void = () => undefined;

    mockRetriableFetch.mockImplementationOnce(
      () =>
        new Promise<FetchResponse>(resolve => {
          resolveFetch = resolve;
        })
    );

    const { unmount, onFailure } = setupTest();

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledTimes(1);
    });

    unmount();
    await act(async () => {
      resolveFetch(abortedResponse);
    });

    expect(onFailure).not.toHaveBeenCalled();
  });

  it("should not fail when a stale reserve request resolves as aborted after retry", async () => {
    // eslint-disable-next-line functional/no-let
    let resolveStaleFetch: (value: FetchResponse) => void = () => undefined;

    mockRetriableFetch
      .mockImplementationOnce(
        () =>
          new Promise<FetchResponse>(resolve => {
            resolveStaleFetch = resolve;
          })
      )
      .mockResolvedValueOnce(successResponse(200, reserveResponse));

    const { result, onFailure } = setupTest();

    await waitFor(() => {
      expect(mockRetriableFetch).toHaveBeenCalledTimes(1);
    });

    await act(async () => result.current.generateLoginSource());

    await waitFor(() => {
      expect(result.current.loginSourceState.status).toBe(
        "one-identity-authorize"
      );
    });

    await act(async () => {
      resolveStaleFetch(abortedResponse);
    });

    expect(onFailure).not.toHaveBeenCalled();
    expect(result.current.loginSourceState.status).toBe(
      "one-identity-authorize"
    );
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
    expect(onFailure).toHaveBeenCalledWith({
      reason: "Unable to generate ephemeral public key"
    });
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

  it.each([
    { name: "auth", flow: LOGIN_TYPES.AUTH, sendsCurrentUser: false },
    { name: "reauth", flow: LOGIN_TYPES.REAUTH, sendsCurrentUser: true }
  ])(
    "should send current_user in the reserve body only when re-authenticating ($name)",
    async ({ flow, sendsCurrentUser }) => {
      mockRetriableFetch.mockResolvedValue(
        successResponse(200, reserveResponse)
      );

      // The stored fiscal code survives logout: it is set in both flows
      const store = createTestStore();
      store.dispatch(
        setProfileHashedFiscalCode("AAAAAA00A00A000A" as FiscalCode)
      );
      const hashedFiscalCode = hashedProfileFiscalCodeSelector(
        store.getState()
      );
      expect(hashedFiscalCode).toBeDefined();

      setupTest({ flow, store });

      await waitFor(() => {
        expect(mockRetriableFetch).toHaveBeenCalledWith(
          `${apiUrlPrefix}/api/auth/v1/reserve`,
          expect.anything()
        );
      });

      const [, { body }] = mockRetriableFetch.mock.calls[0];
      expect(JSON.parse(body).current_user).toBe(
        sendsCurrentUser ? hashedFiscalCode : undefined
      );
    }
  );

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
        expect(onFailure).toHaveBeenCalledWith({ reason: "mismatch", url });
      });
    });
  });

  describe("followRedirectsNatively", () => {
    const ssoUrl = "https://idp.example.com/sso?SAMLRequest=encoded-request";
    const errorUrl =
      "https://dev.oneid.pagopa.it/login/error?error_code=GENERIC_HTML_ERROR";

    beforeEach(() => {
      mockRetriableFetch.mockResolvedValue(
        successResponse(200, reserveResponse)
      );
    });

    it.each([
      { name: "auth", flow: "auth" as const },
      { name: "reauth", flow: "reauth" as const },
      { name: "FCI_auth", flow: "FCI_auth" as const }
    ])(
      "tracks configuration redirects and preserves failure for $name",
      async ({ flow }) => {
        const spyTrackLoginOIConfigurationError = jest
          .spyOn(authenticationAnalytics, "trackLoginOIConfigurationError")
          .mockImplementation();
        jest.mocked(followNativeRedirectsAndVerifySaml).mockResolvedValue(
          err({
            reason: "Missing SAMLRequest parameter in URL",
            url: errorUrl
          })
        );
        const { result, onFailure } = setupTest({
          flow,
          followRedirectsNatively: true
        });

        await waitFor(() => {
          expect(result.current.loginSourceState.status).toBe("failure");
        });
        expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledTimes(1);
        expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledWith(
          errorUrl,
          flow
        );
        expect(onFailure).toHaveBeenCalledWith({
          reason: expect.stringContaining("Missing SAMLRequest")
        });
      }
    );

    it.each([
      {
        name: "a full configuration error URL",
        url: errorUrl,
        expected: 1
      },
      {
        name: "a URL whose query was lost natively",
        url: "https://dev.oneid.pagopa.it/login/error",
        expected: 1
      },
      { name: "a missing native URL", url: undefined, expected: 0 },
      { name: "an ordinary URL", url: ssoUrl, expected: 0 }
    ])(
      "should handle $name in native rejections",
      async ({ url, expected }) => {
        const spyTrackLoginOIConfigurationError = jest
          .spyOn(authenticationAnalytics, "trackLoginOIConfigurationError")
          .mockImplementation();
        jest
          .mocked(followNativeRedirectsAndVerifySaml)
          .mockResolvedValue(err({ reason: "NativeRedirectError", url }));

        const { result, onFailure } = setupTest({
          followRedirectsNatively: true
        });

        await waitFor(() => {
          expect(result.current.loginSourceState.status).toBe("failure");
        });
        expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledTimes(
          expected
        );
        if (expected) {
          expect(spyTrackLoginOIConfigurationError).toHaveBeenCalledWith(
            url,
            "auth"
          );
        }
        expect(onFailure).toHaveBeenCalled();
      }
    );

    it("should not track missing SAMLRequest on an ordinary redirect", async () => {
      const spyTrackLoginOIConfigurationError = jest
        .spyOn(authenticationAnalytics, "trackLoginOIConfigurationError")
        .mockImplementation();
      jest
        .mocked(followNativeRedirectsAndVerifySaml)
        .mockResolvedValue(
          err({ reason: "Missing SAMLRequest parameter in URL", url: ssoUrl })
        );
      const { result, onFailure } = setupTest({
        followRedirectsNatively: true
      });

      await waitFor(() => {
        expect(result.current.loginSourceState.status).toBe("failure");
      });

      expect(spyTrackLoginOIConfigurationError).not.toHaveBeenCalled();
      expect(onFailure).toHaveBeenCalledWith({
        reason: expect.stringContaining("Missing SAMLRequest")
      });
    });

    it("should not follow the redirects natively when disabled", async () => {
      const { result } = setupTest({ followRedirectsNatively: false });

      await waitFor(() => {
        expect(result.current.loginSourceState.status).toBe(
          "one-identity-authorize"
        );
      });
      expect(followNativeRedirectsAndVerifySaml).not.toHaveBeenCalled();
    });

    it("should follow the /authorize redirects natively and expose the verified IDP SSO URL", async () => {
      jest
        .mocked(followNativeRedirectsAndVerifySaml)
        .mockResolvedValue(ok(ssoUrl));

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
        followNativeRedirectsAndVerifySaml
      ).mock.lastCall!;
      const parsedAuthorizeUrl = new URLParse(authorizeUrl, true);

      expect(parsedAuthorizeUrl.origin).toBe(
        "https://one-identity.example.com"
      );
      expect(parsedAuthorizeUrl.pathname).toBe("/oidc/authorize");
      expect(parsedAuthorizeUrl.query.client_id).toBe(
        reserveResponse.client_id
      );
      expect(parsedAuthorizeUrl.query.acr_values).toBe(
        reserveResponse.acr_values
      );
      expect(headers["x-pagopa-lollipop-assertion-ref"]).toContain(
        toBase64EncodedThumbprint(mockPublicKey)
      );
      expect(publicKey).toBe(mockPublicKey);
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should expose the following-redirects status while the redirects are pending", async () => {
      jest
        .mocked(followNativeRedirectsAndVerifySaml)
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
        name: "a native error",
        reason: 'NativeRedirectError {"error":"REDIRECTING_ERROR"}'
      },
      {
        name: "a SAML verification error",
        reason: "Mismatch between local and remote ID parameter content"
      },
      { name: "missing redirects", reason: "Missing Redirects" }
    ])("should fail with the reported reason on $name", async ({ reason }) => {
      jest
        .mocked(followNativeRedirectsAndVerifySaml)
        .mockResolvedValue(err({ reason }));

      const { result, onFailure } = setupTest({
        followRedirectsNatively: true
      });

      await waitFor(() => {
        expect(result.current.loginSourceState).toEqual({
          status: "failure",
          error: reason
        });
      });
      expect(onFailure).toHaveBeenCalledWith({ reason });
    });

    it("should discard the result of a stale native redirects flow when generateLoginSource is called again", async () => {
      const spyTrackLoginOIConfigurationError = jest
        .spyOn(authenticationAnalytics, "trackLoginOIConfigurationError")
        .mockImplementation();
      const staleSsoUrl =
        "https://idp.example.com/sso?SAMLRequest=stale-request";
      // eslint-disable-next-line functional/no-let
      let resolveStaleRedirects: (result: RedirectsResult) => void = () =>
        undefined;

      jest
        .mocked(followNativeRedirectsAndVerifySaml)
        .mockImplementationOnce(
          () =>
            new Promise<RedirectsResult>(resolve => {
              resolveStaleRedirects = resolve;
            })
        )
        .mockResolvedValueOnce(ok(ssoUrl));

      const { result } = setupTest({ followRedirectsNatively: true });

      await waitFor(() => {
        expect(followNativeRedirectsAndVerifySaml).toHaveBeenCalledTimes(1);
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
        resolveStaleRedirects(ok(staleSsoUrl));
      });

      expect(result.current.loginSourceState).toEqual({
        status: "assertion-ref-verified",
        webviewSource: { uri: ssoUrl }
      });
      expect(spyTrackLoginOIConfigurationError).not.toHaveBeenCalled();
    });

    it("should not track or fail when a stale configuration error resolves after retry", async () => {
      const trackError = jest
        .spyOn(authenticationAnalytics, "trackLoginOIConfigurationError")
        .mockImplementation();
      // eslint-disable-next-line functional/no-let
      let resolveStaleRedirects: (result: RedirectsResult) => void = () =>
        undefined;
      jest
        .mocked(followNativeRedirectsAndVerifySaml)
        .mockImplementationOnce(
          () =>
            new Promise<RedirectsResult>(resolve => {
              resolveStaleRedirects = resolve;
            })
        )
        .mockResolvedValueOnce(ok(ssoUrl));
      const { result, onFailure } = setupTest({
        followRedirectsNatively: true
      });

      await waitFor(() => {
        expect(followNativeRedirectsAndVerifySaml).toHaveBeenCalledTimes(1);
      });
      await act(async () => result.current.generateLoginSource());

      await waitFor(() => {
        expect(result.current.loginSourceState).toEqual({
          status: "assertion-ref-verified",
          webviewSource: { uri: ssoUrl }
        });
      });
      await act(async () => {
        resolveStaleRedirects(
          err({ reason: "Missing SAMLRequest parameter in URL", url: errorUrl })
        );
      });

      expect(trackError).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
      expect(result.current.loginSourceState).toEqual({
        status: "assertion-ref-verified",
        webviewSource: { uri: ssoUrl }
      });
    });

    it.each([
      {
        name: "missing redirects",
        failure: { reason: "Missing Redirects" }
      },
      {
        name: "a configuration error",
        failure: {
          reason: "Missing SAMLRequest parameter in URL",
          url: errorUrl
        }
      }
    ])(
      "should not track or fail when $name resolves after unmount",
      async ({ failure }) => {
        const trackError = jest
          .spyOn(authenticationAnalytics, "trackLoginOIConfigurationError")
          .mockImplementation();
        // eslint-disable-next-line functional/no-let
        let resolveRedirects: (result: RedirectsResult) => void = () =>
          undefined;

        jest.mocked(followNativeRedirectsAndVerifySaml).mockImplementation(
          () =>
            new Promise<RedirectsResult>(resolve => {
              resolveRedirects = resolve;
            })
        );

        const { unmount, onFailure } = setupTest({
          followRedirectsNatively: true
        });

        await waitFor(() => {
          expect(followNativeRedirectsAndVerifySaml).toHaveBeenCalledTimes(1);
        });

        unmount();
        await act(async () => {
          resolveRedirects(err(failure));
        });

        expect(onFailure).not.toHaveBeenCalled();
        expect(trackError).not.toHaveBeenCalled();
      }
    );
  });
});
