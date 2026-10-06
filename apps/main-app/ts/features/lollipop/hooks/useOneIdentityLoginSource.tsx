import { PublicKey } from "@pagopa/io-react-native-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";

import { handleRegenerateEphemeralKey } from "..";
import { apiUrlPrefix } from "../../../config";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { hashedProfileFiscalCodeSelector } from "../../../store/reducers/crossSessions";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { trackLollipopIdpLoginFailure } from "../../../utils/analytics";
import { unknownToString } from "../../../utils/errors";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../authentication/activeSessionLogin/store/selectors";
import { oneIdentityEnvSelector } from "../../authentication/common/store/selectors/loginConfig";
import {
  AUTH_LEVELS,
  AuthLevel,
  SPID_AUTH_LEVEL_MAP
} from "../../authentication/common/utils";
import { createRetriableFetch } from "../../authentication/common/utils/fetch";
import { jsonFetchToSchema } from "../../authentication/common/utils/jsonFetchToSchema";
import { isFastLoginEnabledSelector } from "../../authentication/fastLogin/store/selectors";
import {
  ephemeralKeyTagSelector,
  ephemeralPublicKeySelector
} from "../store/reducers/lollipop";
import { ReserveSchema } from "../types";
import { toBase64EncodedThumbprint } from "../utils/crypto";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  followNativeRedirectsAndVerifySaml,
  lollipopSamlVerify
} from "../utils/login";

const fetch = createRetriableFetch();

/**
 * Path of the Session Manager endpoint that reserves the public key and returns
 * the `/authorize` parameters.
 */
const reserveEndpointPath = "/api/auth/v1/reserve";

/**
 * State of the OneIdentity login source flow. At any given moment the flow is
 * in exactly one of the following statuses:
 *
 * - `assertion-ref-verified`: the lollipop check succeeded; `webviewSource` is
 *   the IDP SSO URL, safe to (re)load without triggering another check.
 * - `following-redirects`: the `/authorize` redirects are being followed natively
 *   and the lollipop assertion-ref is being verified, outside the WebView (only
 *   when `followRedirectsNatively` is enabled).
 * - `one-identity-authorize`: the initial `/authorize` WebView source is
 *   available to load, but has not gone through the lollipop SAMLRequest check
 *   yet.
 * - `reserving-public-key`: `/reserve` (and ephemeral key generation) is in
 *   progress.
 * - `verifying-assertion-ref`: the WebView navigated to the IDP SSO URL and its
 *   lollipop assertion-ref is being verified; the WebView is hidden meanwhile.
 * - `failure`: The `/reserve` request, ephemeral key generation, or SAML
 *   verification failed.
 */
type LoginSourceState =
  | { error: string; status: "failure" }
  | {
      status: "assertion-ref-verified" | "one-identity-authorize";
      webviewSource: WebViewSourceUri;
    }
  | { status: "following-redirects" }
  | { status: "reserving-public-key" }
  | { status: "verifying-assertion-ref"; url: string };

/**
 * Builds a failure reason for the native redirects flow, including the native
 * error details when available.
 */
const getNativeRedirectsFailureReason = (error: unknown): string =>
  unknownToString(error);

/** Builds the request body for the `/reserve` endpoint. */
const buildReserveRequestBody = (
  env: string,
  minAuthLevel: AuthLevel,
  publicKey: PublicKey,
  hashAlgorithm: string,
  isFastLogin: boolean,
  hashedFiscalCode?: string
) => ({
  env: env.toUpperCase(),
  min_auth_level: SPID_AUTH_LEVEL_MAP[minAuthLevel],
  lollipop_pub_key: Buffer.from(JSON.stringify(publicKey)).toString(
    "base64url"
  ),
  lollipop_hash_algo: hashAlgorithm,
  login_type: isFastLogin ? "LV" : "LEGACY",
  ...(hashedFiscalCode && { current_user: hashedFiscalCode })
});

/** Builds the OneIdentity `/authorize` URL to open in the login WebView. */
const buildAuthorizationUrl = (
  reserveResponse: {
    authorization_endpoint: string;
    client_id: string;
    nonce: string;
    redirect_uri: string;
    state: string;
  },
  idp: string,
  minAuthLevel: AuthLevel
): string => {
  const { authorization_endpoint, client_id, nonce, redirect_uri, state } =
    reserveResponse;
  const authorizationUrl = new URLParse(authorization_endpoint, true);
  authorizationUrl.set("query", {
    idp,
    client_id,
    redirect_uri,
    scope: "openid",
    state,
    nonce,
    response_type: "code",
    minAuthLevel: SPID_AUTH_LEVEL_MAP[minAuthLevel]
  });
  return authorizationUrl.toString();
};

/**
 * Builds the `x-pagopa-lollipop-assertion-ref` header for the OneIdentity
 * `/authorize` request, required so that OneIdentity can associate the incoming
 * request with the lollipop session just reserved via `/reserve`.
 */
const buildAuthorizeHeaders = (publicKey: PublicKey) => ({
  "x-pagopa-lollipop-assertion-ref": `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toBase64EncodedThumbprint(
    publicKey
  )}`
});

/**
 * Builds the WebView source for the OneIdentity `/authorize` request: the URL
 * (via `buildAuthorizationUrl`) plus the headers from `buildAuthorizeHeaders`.
 */
const buildWebviewSource = (
  uri: string,
  publicKey: PublicKey
): WebViewSourceUri => ({
  uri,
  headers: buildAuthorizeHeaders(publicKey)
});

export type UseOneIdentityLoginSource = (params: {
  /**
   * When `true`, the `/authorize` redirects up to the IDP `SAMLRequest` are
   * followed natively via `getRedirects` (as in the legacy login flow) instead
   * of inside the WebView, which then directly loads the verified IDP SSO URL.
   * Intended for devices where the WebView fails to follow those redirects.
   * Defaults to `false`.
   */
  followRedirectsNatively?: boolean;
  /** The ID of the identity provider the user selected to login with. */
  idpId: string;
  /**
   * The minimum required SPID level for the authentication flow. Defaults to
   * "L2".
   */
  minAuthLevel?: AuthLevel;
  /** Handler called upon a failure during the login flow. */
  onFailure: (reason: string) => void;
}) => {
  /**
   * Handler that restarts the login flow by generating a new login source. It
   * automatically resets the internal state and safely aborts any ongoing
   * network requests.
   */
  generateLoginSource: () => Promise<void>;
  /** The current state of the OneIdentity OIDC flow. */
  loginSourceState: LoginSourceState;
  /**
   * Handler to be passed to the WebView's `onShouldStartLoadWithRequest` prop.
   * Intercepts navigation towards the identity provider and verifies the
   * lollipop assertion-ref.
   */
  shouldBlockUrlNavigationWhileCheckingLollipop: (url: string) => boolean;
};

export const useOneIdentityLoginSource: UseOneIdentityLoginSource = ({
  followRedirectsNatively = false,
  idpId,
  onFailure,
  minAuthLevel = AUTH_LEVELS.L2
}) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [loginSourceState, setLoginSourceState] = useState<LoginSourceState>({
    status: "reserving-public-key"
  });

  const dispatch = useIODispatch();
  const ephemeralKeyTag = useIOSelector(ephemeralKeyTagSelector);
  const maybeEphemeralPublicKey = useIOSelector(ephemeralPublicKeySelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const hashedFiscalCode = useIOSelector(hashedProfileFiscalCodeSelector);
  const isActiveSessionFastLogin = useIOSelector(
    isActiveSessionFastLoginEnabledSelector
  );
  const oneIdentityEnv = useIOSelector(oneIdentityEnvSelector);

  const shouldBlockUrlNavigationWhileCheckingLollipop = useCallback(
    (url: string) => {
      if (loginSourceState.status === "verifying-assertion-ref") {
        // Lollipop assertion-ref is being verified, prevent the WebView from
        // loading the current URL.
        return true;
      }

      const urlEncodedSamlRequest = new URLParse(url, true).query?.SAMLRequest;
      if (!urlEncodedSamlRequest) {
        // Not the SAMLRequest redirect: nothing to check, let it load.
        return false;
      }

      if (
        loginSourceState.status === "one-identity-authorize" &&
        maybeEphemeralPublicKey
      ) {
        // If we encounter a SAMLRequest and we are in the authorize phase
        // intercept the flow to verify the lollipop assertion-ref.
        setLoginSourceState({
          status: "verifying-assertion-ref",
          url
        });
        lollipopSamlVerify(
          urlEncodedSamlRequest,
          maybeEphemeralPublicKey,
          () => {
            setLoginSourceState({
              status: "assertion-ref-verified",
              webviewSource: { uri: url }
            });
          },
          reason => {
            setLoginSourceState({
              status: "failure",
              error: reason
            });
            trackLollipopIdpLoginFailure(reason);
            onFailure(reason);
          }
        );
        return true;
      }

      return false;
    },
    [loginSourceState.status, maybeEphemeralPublicKey, onFailure]
  );

  const generateLoginSource = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoginSourceState({ status: "reserving-public-key" });

    // A new ephemeral key pair is generated to guarantee
    // the public key uniqueness on every request.
    const publicKey = await handleRegenerateEphemeralKey(
      ephemeralKeyTag,
      mixpanelEnabled,
      dispatch
    );

    if (!publicKey) {
      setLoginSourceState({
        status: "failure",
        error: "Unable to generate ephemeral public key"
      });
      onFailure("Unable to generate ephemeral public key");
      return;
    }

    const reserveUrl = `${apiUrlPrefix}${reserveEndpointPath}`;
    const reserveRequestBody = buildReserveRequestBody(
      oneIdentityEnv,
      minAuthLevel,
      publicKey,
      DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
      isActiveSessionLogin ? isActiveSessionFastLogin : isFastLogin,
      isActiveSessionLogin ? hashedFiscalCode : undefined
    );

    const reservePromise = fetch(reserveUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserveRequestBody),
      signal: controller.signal
    });
    const result = await jsonFetchToSchema(reservePromise, ReserveSchema);

    if (result.isErr()) {
      abortControllerRef.current = null;
      setLoginSourceState({ status: "failure", error: result.error });
      onFailure(result.error);
      return;
    }

    const authorizationUrl = buildAuthorizationUrl(
      result.value,
      idpId,
      minAuthLevel
    );

    if (followRedirectsNatively) {
      setLoginSourceState({ status: "following-redirects" });

      try {
        const lastRedirect = await followNativeRedirectsAndVerifySaml(
          authorizationUrl,
          buildAuthorizeHeaders(publicKey),
          publicKey
        );
        // getRedirects cannot be aborted: discard the result of a flow that
        // has been restarted or unmounted in the meantime.
        if (controller.signal.aborted) {
          return;
        }
        setLoginSourceState({
          status: "assertion-ref-verified",
          webviewSource: { uri: lastRedirect }
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const reason = getNativeRedirectsFailureReason(error);
        setLoginSourceState({ status: "failure", error: reason });
        onFailure(reason);
      }

      abortControllerRef.current = null;
      return;
    }

    abortControllerRef.current = null;
    setLoginSourceState({
      status: "one-identity-authorize",
      webviewSource: buildWebviewSource(authorizationUrl, publicKey)
    });
  }, [
    followRedirectsNatively,
    idpId,
    ephemeralKeyTag,
    mixpanelEnabled,
    dispatch,
    oneIdentityEnv,
    minAuthLevel,
    isActiveSessionLogin,
    isActiveSessionFastLogin,
    isFastLogin,
    hashedFiscalCode,
    onFailure
  ]);

  useEffect(() => {
    void generateLoginSource();

    return () => abortControllerRef.current?.abort();
    // Intentionally run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loginSourceState,
    shouldBlockUrlNavigationWhileCheckingLollipop,
    generateLoginSource
  };
};
