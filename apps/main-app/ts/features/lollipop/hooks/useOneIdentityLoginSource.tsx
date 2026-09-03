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
import { SpidIdp } from "../../../utils/idps";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../authentication/activeSessionLogin/store/selectors";
import { oneIdentityEnvSelector } from "../../authentication/common/store/selectors/loginConfig";
import { createRetriableFetch } from "../../authentication/common/utils/fetch";
import { jsonFetchToSchema } from "../../authentication/common/utils/jsonFetchToSchema";
import { isFastLoginEnabledSelector } from "../../authentication/fastLogin/store/selectors";
import { SpidLevel } from "../../authentication/login/cie/utils";
import {
  ephemeralKeyTagSelector,
  ephemeralPublicKeySelector
} from "../store/reducers/lollipop";
import { ReserveSchema } from "../types";
import { toBase64EncodedThumbprint } from "../utils/crypto";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  lollipopSamlVerify
} from "../utils/login";

const fetch = createRetriableFetch();

/**
 * Path of the Session Manager endpoint that reserves the public key
 * and returns the `/authorize` parameters.
 */
const reserveEndpointPath = "/api/auth/v2/reserve";

/**
 * State of the OneIdentity login source flow. At any given moment the flow
 * is in exactly one of the following statuses:
 * - `assertion-ref-verified`: the lollipop check succeeded; `webviewSource` is the IDP
 *   SSO URL, safe to (re)load without triggering another check.
 * - `one-identity-authorize`: the initial `/authorize` WebView source is available to load,
 *   but has not gone through the lollipop SAMLRequest check yet.
 * - `reserving-public-key`: `/reserve` (and ephemeral key generation) is in progress.
 * - `verifying-assertion-ref`: the WebView navigated to the IDP SSO URL and its
 *   lollipop assertion-ref is being verified; the WebView is hidden meanwhile.
 * - `failure`: The `/reserve` request, ephemeral key generation, or SAML verification failed.
 */
type LoginSourceState =
  | { error: string; status: "failure" }
  | {
      status: "assertion-ref-verified" | "one-identity-authorize";
      webviewSource: WebViewSourceUri;
    }
  | { status: "reserving-public-key" }
  | { status: "verifying-assertion-ref"; url: string };

/**
 * Builds the headers required by the Session Manager `/reserve` endpoint.
 */
const buildReserveHeaders = (
  publicKey: PublicKey,
  hashAlgorithm: string,
  isFastLogin: boolean,
  hashedFiscalCode?: string
) => ({
  "x-pagopa-lollipop-hash-algorithm": hashAlgorithm,
  "x-pagopa-lollipop-pub-key": Buffer.from(JSON.stringify(publicKey)).toString(
    "base64url"
  ),
  "x-pagopa-login-type": isFastLogin ? "LV" : "LEGACY",
  ...(hashedFiscalCode && { "x-pagopa-current-user": hashedFiscalCode })
});

/**
 * Builds the OneIdentity `/authorize` URL to open in the login WebView.
 */
const buildAuthorizationUrl = (
  reserveResponse: {
    client_id: string;
    issuer: string;
    nonce: string;
    redirect_uri: string;
    state: string;
  },
  idp: string,
  minAuthLevel: SpidLevel
): string => {
  const { client_id, issuer, nonce, redirect_uri, state } = reserveResponse;
  const authorizationUrl = new URLParse(`${issuer}oidc/authorize`, true);
  authorizationUrl.set("query", {
    idp,
    client_id,
    redirect_uri,
    scope: "openid",
    state,
    nonce,
    response_type: "code",
    minAuthLevel
  });
  return authorizationUrl.toString();
};

/**
 * Builds the WebView source for the OneIdentity `/authorize` request: the
 * URL (via `buildAuthorizationUrl`) plus the `assertion-ref` header, required so
 * that OneIdentity can associate the incoming request with the lollipop
 * session just reserved via `/reserve`.
 */
const buildWebviewSource = (
  uri: string,
  publicKey: PublicKey
): WebViewSourceUri => ({
  uri,
  headers: {
    "assertion-ref": `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toBase64EncodedThumbprint(
      publicKey
    )}`
  }
});

export type UseOneIdentityLoginSource = (params: {
  /**
   * The identity provider the user selected to login with.
   */
  idp: SpidIdp;
  /**
   * The minimum required SPID level for the authentication flow. Defaults to "SpidL2".
   */
  minAuthLevel?: SpidLevel;
  /**
   * Handler called upon a failure during the login flow.
   */
  onFailure: (reason: string) => void;
}) => {
  /**
   * The current state of the OneIdentity OIDC flow.
   */
  loginSourceState: LoginSourceState;
  /**
   * Handler to be passed to the WebView's `onShouldStartLoadWithRequest` prop.
   * Intercepts navigation towards the identity provider and verifies the lollipop assertion-ref.
   */
  shouldBlockUrlNavigationWhileCheckingLollipop: (url: string) => boolean;
};

export const useOneIdentityLoginSource: UseOneIdentityLoginSource = ({
  idp,
  onFailure,
  minAuthLevel = "SpidL2"
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

    const reserveUrl = new URLParse(
      `${apiUrlPrefix}${reserveEndpointPath}`,
      true
    );
    reserveUrl.set("query", {
      env: oneIdentityEnv.toUpperCase(),
      minAuthLevel
    });

    const requestPromise = fetch(reserveUrl.toString(), {
      method: "POST",
      headers: buildReserveHeaders(
        publicKey,
        DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
        isActiveSessionLogin ? isActiveSessionFastLogin : isFastLogin,
        isActiveSessionLogin ? hashedFiscalCode : undefined
      ),
      signal: controller.signal
    });
    const result = await jsonFetchToSchema(requestPromise, ReserveSchema);
    // Clear the abort controller reference as the request has completed.
    abortControllerRef.current = null;

    if (result.isErr()) {
      setLoginSourceState({ status: "failure", error: result.error });
      onFailure(result.error);
      return;
    }

    const authorizationUrl = buildAuthorizationUrl(
      result.value,
      idp.id,
      minAuthLevel
    );

    setLoginSourceState({
      status: "one-identity-authorize",
      webviewSource: buildWebviewSource(authorizationUrl, publicKey)
    });
  }, [
    idp,
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
    shouldBlockUrlNavigationWhileCheckingLollipop
  };
};
