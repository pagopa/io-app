import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import I18n from "i18next";
import { memo, useCallback, useMemo, useRef } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";

import { LoadingScreenContent } from "../../../../components/screens/LoadingScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { trackLoginError } from "../../../../utils/analytics";
import { SpidIdp } from "../../../../utils/idps";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../utils/supportAssistance";
import { getUrlBasepath } from "../../../../utils/url";
import {
  OneIdentityLoginSourceError,
  useOneIdentityLoginSource
} from "../../../lollipop/hooks/useOneIdentityLoginSource";
import { trackSpidLoginIntent } from "../../activeSessionLogin/screens/analytics";
import { getSpidErrorCodeDescription } from "../../login/idp/utils/spidErrorCode";
import { useOneIdentityPosteIDApp2AppEducational } from "../hooks/useOneIdentityPosteIDApp2AppEducational";
import { idpLoginUrlChanged } from "../store/actions";
import {
  AUTH_LEVELS,
  getIntentFallbackUrl,
  LOGIN_TYPES,
  LoginType,
  onLoginUriChanged,
  originSchemasWhiteList
} from "../utils";

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
      /** `code` and `description` come from the native WebView error. */
      payload: { code: number; description: string; url: string };
      type: "WEBVIEW_ERROR";
    }
  | {
      payload: { code?: string; message?: string; reason: string };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: { error: OneIdentityLoginSourceError };
      type: "ONE_IDENTITY_LOGIN_FAILURE";
    }
  | {
      payload: { statusCode: number; url: string };
      type: "WEBVIEW_HTTP_ERROR";
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
      (error: OneIdentityLoginSourceError) => {
        onEvent({
          type: "ONE_IDENTITY_LOGIN_FAILURE",
          payload: { error }
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
              statusCode: nativeEvent.statusCode
            }
          });
          return;
        }

        onEvent({
          type: "WEBVIEW_ERROR",
          payload: {
            url: nativeEvent.url,
            code: nativeEvent.code,
            description: nativeEvent.description
          }
        });
      },
      [idp.id, onEvent]
    );

    const handleLoginFailure = useCallback(
      (code?: string, message?: string) => {
        const reason = code
          ? `login failed with code (${code}) : ${getSpidErrorCodeDescription(code)}`
          : message
            ? `login failed with message ${message}`
            : "login failed with no error code or message available";
        handleSendAssistanceLog(choosenTool, reason);

        onEvent({
          type: "LOGIN_FAILURE",
          payload: { code, message, reason }
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
        // URL can be loaded if it's not the login URL containing the session token - this avoids
        // making a (useless) GET request with the session in the URL
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

    if (
      loginSourceState.status === "reserving-public-key" ||
      loginSourceState.status === "verifying-assertion-ref" ||
      loginSourceState.status === "following-redirects"
    ) {
      return <IdpWebViewLoginLoading />;
    }

    if (loginSourceState.status === "failure") {
      return null;
    }

    return (
      <View style={{ flex: 1 }}>
        <WebView
          androidCameraAccessDisabled
          androidMicrophoneAccessDisabled
          cacheEnabled={false}
          onError={handleError}
          onHttpError={handleError}
          onLoad={presentOncePosteIdBottomSheet}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoading}
          originWhitelist={originSchemasWhiteList}
          renderLoading={IdpWebViewLoginLoading}
          source={loginSourceState.webviewSource}
          startInLoadingState={true}
          testID="webview-idp-login-screen"
          textZoom={100}
          userAgent={defaultUserAgent}
        />
        {posteIdBottomSheet}
      </View>
    );
  }
);

const IdpWebViewLoginLoading = () => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingScreenContent title={I18n.t("global.genericWaiting")} />
  </View>
);
