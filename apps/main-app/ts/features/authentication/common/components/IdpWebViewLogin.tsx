import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import { memo, useCallback, useMemo, useRef } from "react";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { trackLoginError } from "../../../../utils/analytics";
import { SpidIdp } from "../../../../utils/idps";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../utils/supportAssistance";
import { getUrlBasepath } from "../../../../utils/url";
import { useOneIdentityLoginSource } from "../../../lollipop/hooks/useOneIdentityLoginSource";
import { trackSpidLoginIntent } from "../../activeSessionLogin/screens/analytics";
import { trackLoginOIConfigurationError } from "../../common/analytics";
import { LoadingOverlay } from "../../login/cie/shared/LoadingSpinnerOverlay";
import { getSpidErrorCodeDescription } from "../../login/idp/utils/spidErrorCode";
import { useOneIdentityPosteIDApp2AppEducational } from "../hooks/useOneIdentityPosteIDApp2AppEducational";
import { idpLoginUrlChanged } from "../store/actions";
import {
  AUTH_LEVELS,
  getIntentFallbackUrl,
  isOneIdentityErrorUrl,
  LOGIN_TYPES,
  LoginType,
  onLoginUriChanged,
  originSchemasWhiteList
} from "../utils";
import { getWebViewFailure, LoginFailure } from "../utils/loginFailure";

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

/**
 * The text appended to the assistance (Zendesk) log when a SPID login ends on a
 * Session Manager page without a token. Do not change it.
 */
const getSpidBackendFailureAssistanceLog = (failure: LoginFailure): string => {
  const { errorCode, errorMessage } =
    failure.kind === "backend" ? failure.details : {};
  return errorCode
    ? `login failed with code (${errorCode}) : ${getSpidErrorCodeDescription(
        errorCode
      )}`
    : errorMessage
      ? `login failed with message ${errorMessage}`
      : "login failed with no error code or message available";
};

export type IdpWebViewLoginProps = {
  /** The login flow this WebView is part of; defaults to a first-time login. */
  flow?: LoginType;
  /** The IDP the user selected to login with. */
  idp: SpidIdp;
  /** Called when the login fails, whatever the cause. */
  onFailure: (failure: LoginFailure) => void;
  /** Called with the session token when the login succeeds. */
  onSuccess: (token: string) => void;
};

export const IdpWebViewLogin = memo(
  ({
    idp,
    flow = LOGIN_TYPES.AUTH,
    onFailure,
    onSuccess
  }: IdpWebViewLoginProps) => {
    const dispatch = useIODispatch();

    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const choosenTool = useMemo(
      () => assistanceToolRemoteConfig(assistanceToolConfig),
      [assistanceToolConfig]
    );

    const lastTrackedUrl = useRef<string | undefined>(undefined);

    const { loginSourceState, shouldBlockUrlNavigationWhileCheckingLollipop } =
      useOneIdentityLoginSource({
        flow,
        idpId: idp.id,
        onFailure,
        minAuthLevel: AUTH_LEVELS.L2
      });

    const {
      bottomSheet: posteIdBottomSheet,
      presentOnce: presentOncePosteIdBottomSheet
    } = useOneIdentityPosteIDApp2AppEducational(idp);

    const handleWebViewError = useCallback(
      (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
        trackLoginError(idp.id, event);

        onFailure(getWebViewFailure(event));
      },
      [idp.id, onFailure]
    );

    const handleError = useCallback(
      (failure: LoginFailure) => {
        handleSendAssistanceLog(
          choosenTool,
          getSpidBackendFailureAssistanceLog(failure)
        );

        onFailure(failure);
      },
      [choosenTool, onFailure]
    );

    const handleLoginSuccess = useCallback(
      (token: string) => {
        handleSendAssistanceLog(choosenTool, "login success");
        onSuccess(token);
      },
      [choosenTool, onSuccess]
    );

    const handleShouldStartLoading = useCallback(
      (event: WebViewNavigation): boolean => {
        const url = event.url;

        if (isOneIdentityErrorUrl(url)) {
          trackLoginOIConfigurationError(url, flow);
        }

        // if an intent is coming from the IDP login form, extract the fallbackUrl and use it in Linking.openURL
        const idpIntent = getIntentFallbackUrl(url);
        if (idpIntent != null) {
          void trackSpidLoginIntent(idp, flow);
          void Linking.openURL(idpIntent);
          return false;
        }

        if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
          return false;
        }

        const isLoginUrlWithToken = onLoginUriChanged(
          handleError,
          handleLoginSuccess,
          idp.id as keyof IdpData,
          flow
        )(event);
        // URL can be loaded if it's not containing the token
        return !isLoginUrlWithToken;
      },
      [
        flow,
        handleError,
        handleLoginSuccess,
        idp,
        shouldBlockUrlNavigationWhileCheckingLollipop
      ]
    );

    const handleNavigationStateChange = useCallback(
      (event: WebViewNavigation) => {
        const urlBasePath = getUrlBasepath(event.url);
        if (urlBasePath !== lastTrackedUrl.current) {
          lastTrackedUrl.current = urlBasePath;
          dispatch(idpLoginUrlChanged({ url: urlBasePath }));
        }
      },
      [dispatch]
    );

    if (loginSourceState.status === "failure") {
      return null;
    }

    // The overlay covers the waits before the WebView has a source. The
    // assertion-ref check is local and takes a few milliseconds, so the overlay
    // stays off meanwhile to avoid a flash, and the WebView stays mounted: a new
    // incognito instance would lose the OneIdentity session cookie.
    const isLoading =
      loginSourceState.status === "reserving-public-key" ||
      loginSourceState.status === "following-redirects";

    const webviewSource = isLoading
      ? undefined
      : loginSourceState.webviewSource;

    return (
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {webviewSource && (
          <>
            <WebView
              androidCameraAccessDisabled
              androidMicrophoneAccessDisabled
              cacheEnabled={false}
              incognito
              onError={handleWebViewError}
              onHttpError={handleWebViewError}
              onLoad={presentOncePosteIdBottomSheet}
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoading}
              originWhitelist={originSchemasWhiteList}
              renderLoading={() => <LoadingOverlay />}
              source={webviewSource}
              startInLoadingState={true}
              testID="webview-idp-login-screen"
              textZoom={100}
              userAgent={defaultUserAgent}
            />
            {posteIdBottomSheet}
          </>
        )}
      </LoadingSpinnerOverlay>
    );
  }
);
