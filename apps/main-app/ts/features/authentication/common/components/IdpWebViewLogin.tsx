import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import * as O from "fp-ts/lib/Option";
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
import { trackSpidLoginError } from "../../../../utils/analytics";
import { SpidIdp } from "../../../../utils/idps";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../utils/supportAssistance";
import { getUrlBasepath } from "../../../../utils/url";
import { useOneIdentityLoginSource } from "../../../lollipop/hooks/useOneIdentityLoginSource";
import {
  LoginType,
  trackSpidLoginIntent
} from "../../activeSessionLogin/screens/analytics";
import { getSpidErrorCodeDescription } from "../../login/idp/utils/spidErrorCode";
import { idpLoginUrlChanged } from "../store/actions";
import { getIntentFallbackUrl, onLoginUriChanged } from "../utils/login";
import { originSchemasWhiteList } from "../utils/originSchemasWhiteList";

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
      payload: { code?: string; message?: string; reason: string };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: { statusCode: number; url: string };
      type: "WEBVIEW_HTTP_ERROR";
    }
  | { payload: { token: string }; type: "LOGIN_SUCCESS" }
  | { payload: { url: string }; type: "WEBVIEW_ERROR" };

export const IdpWebViewLogin = memo(
  ({ idp, flow = "auth", onEvent }: IdpWebViewLoginProps) => {
    const dispatch = useIODispatch();

    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const choosenTool = useMemo(
      () => assistanceToolRemoteConfig(assistanceToolConfig),
      [assistanceToolConfig]
    );

    const lastTrackedUrl = useRef<string | undefined>(undefined);

    const handleFailure = useCallback(
      (reason: string) => {
        onEvent({
          type: "LOGIN_FAILURE",
          payload: { reason }
        });
      },
      [onEvent]
    );

    const { loginSourceState, shouldBlockUrlNavigationWhileCheckingLollipop } =
      useOneIdentityLoginSource({
        idp,
        onFailure: handleFailure,
        minAuthLevel: "SpidL2"
      });

    const handleError = useCallback(
      (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
        trackSpidLoginError(idp.id, event);

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
          payload: { url: nativeEvent.url }
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
        if (O.isSome(idpIntent)) {
          void trackSpidLoginIntent(idp, flow);
          void Linking.openURL(idpIntent.value);
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
      loginSourceState.status === "verifying-assertion-ref"
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
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoading}
          originWhitelist={originSchemasWhiteList}
          renderLoading={IdpWebViewLoginLoading}
          source={loginSourceState.webviewSource}
          startInLoadingState={true}
          testID="webview-idp-login-screen"
          textZoom={100}
        />
      </View>
    );
  }
);

const IdpWebViewLoginLoading = () => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingScreenContent title={I18n.t("global.genericWaiting")} />
  </View>
);
