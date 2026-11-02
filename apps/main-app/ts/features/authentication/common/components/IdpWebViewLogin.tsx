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
import {
  getWebViewFailureData,
  LoginFailureData,
  WebViewFailureData
} from "../utils/loginErrorDebugInfo";

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

export type IdpWebViewLoginProps = {
  /** The login flow this WebView is part of; defaults to a first-time login. */
  flow?: LoginType;
  /** The IDP the user selected to login with. */
  idp: SpidIdp;
  /** Callback invoked for various authentication-related events. */
  onEvent: (event: WebViewLoginEvent) => void;
};

export type WebViewLoginEvent =
  | {
      payload: {
        code?: string;
        failureData: LoginFailureData;
        message?: string;
      };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: {
        failureData: WebViewFailureData;
        statusCode: number;
        url: string;
      };
      type: "WEBVIEW_HTTP_ERROR";
    }
  | {
      payload: { failureData: WebViewFailureData; url: string };
      type: "WEBVIEW_ERROR";
    }
  | { payload: { token: string }; type: "LOGIN_SUCCESS" };

export const IdpWebViewLogin = memo(
  ({ idp, flow = LOGIN_TYPES.AUTH, onEvent }: IdpWebViewLoginProps) => {
    const dispatch = useIODispatch();

    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const choosenTool = useMemo(
      () => assistanceToolRemoteConfig(assistanceToolConfig),
      [assistanceToolConfig]
    );

    const lastTrackedUrl = useRef<string | undefined>(undefined);

    const handleFailure = useCallback(
      (failureData: LoginFailureData) => {
        onEvent({
          type: "LOGIN_FAILURE",
          payload: { failureData }
        });
      },
      [onEvent]
    );

    const { loginSourceState, shouldBlockUrlNavigationWhileCheckingLollipop } =
      useOneIdentityLoginSource({
        flow,
        idpId: idp.id,
        onFailure: handleFailure,
        minAuthLevel: AUTH_LEVELS.L2
      });

    const {
      bottomSheet: posteIdBottomSheet,
      presentOnce: presentOncePosteIdBottomSheet
    } = useOneIdentityPosteIDApp2AppEducational(idp);

    const handleError = useCallback(
      (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
        trackLoginError(idp.id, event);

        const { nativeEvent } = event;
        if ("statusCode" in nativeEvent) {
          onEvent({
            type: "WEBVIEW_HTTP_ERROR",
            payload: {
              url: nativeEvent.url,
              statusCode: nativeEvent.statusCode,
              failureData: getWebViewFailureData(event)
            }
          });
          return;
        }

        onEvent({
          type: "WEBVIEW_ERROR",
          payload: {
            url: nativeEvent.url,
            failureData: getWebViewFailureData(event)
          }
        });
      },
      [idp.id, onEvent]
    );

    const handleLoginFailure = useCallback(
      (code?: string, message?: string) => {
        const reason = code
          ? `login failed with code (${code}) : ${getSpidErrorCodeDescription(
              code
            )}`
          : message
            ? `login failed with message ${message}`
            : "login failed with no error code or message available";
        handleSendAssistanceLog(choosenTool, reason);

        onEvent({
          type: "LOGIN_FAILURE",
          payload: { code, message, failureData: { reason } }
        });
      },
      [choosenTool, onEvent]
    );

    const handleLoginSuccess = useCallback(
      (token: string) => {
        handleSendAssistanceLog(choosenTool, "login success");
        onEvent({ type: "LOGIN_SUCCESS", payload: { token } });
      },
      [choosenTool, onEvent]
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
          handleLoginFailure,
          handleLoginSuccess,
          idp.id as keyof IdpData,
          flow
        )(event);
        // URL can be loaded if it's not containing the token
        return !isLoginUrlWithToken;
      },
      [
        flow,
        handleLoginFailure,
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
              onError={handleError}
              onHttpError={handleError}
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
