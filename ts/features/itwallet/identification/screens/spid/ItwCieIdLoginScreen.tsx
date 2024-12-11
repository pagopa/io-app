import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { isCieIdAvailable, openCieIdApp } from "@pagopa/io-react-native-cieid";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  selectAuthUrlOption,
  selectIsLoading
} from "../../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import I18n from "../../../../../i18n";
import { originSchemasWhiteList } from "../../../../../screens/authentication/originSchemasWhiteList";
import { itWalletIssuanceRedirectUri } from "../../../../../config";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { isAndroid, isIos } from "../../../../../utils/platform";

const styles = StyleSheet.create({
  webViewWrapper: { flex: 1 }
});

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent header.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

const isAuthenticationUrl = (url: string) => {
  const authUrlRegex = /\/(livello1|livello2|nextUrl|openApp)(\/|\?|$)/;
  return authUrlRegex.test(url);
};

const IO_LOGIN_CIE_SOURCE_APP = "iologincie";
const IO_LOGIN_CIE_URL_SCHEME = `${IO_LOGIN_CIE_SOURCE_APP}:`;

/**
 * This component renders a WebView that loads the URL obtained from the startAuthFlow.
 * It handles the navigation state changes to detect when the authentication is completed
 * and sends the redirectAuthUrl back to the state machine.
 */
const ItwCieIdLoginScreen = () => {
  const isMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const spidAuthUrl =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const [isWebViewLoading, setWebViewLoading] = useState(true);

  const [authUrl, setAuthUrl] = useState<O.Option<string>>();
  const webViewSource = authUrl || spidAuthUrl;

  useEffect(() => {
    const urlListenerSubscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        if (url.startsWith(IO_LOGIN_CIE_URL_SCHEME)) {
          const [, continueUrl] = url.split(IO_LOGIN_CIE_URL_SCHEME);
          setAuthUrl(O.some(continueUrl));
        }
      }
    );

    return () => urlListenerSubscription.remove();
  }, []);

  const onLoadEnd = useCallback(() => {
    // When CieId app-to-app flow is enabled, stop loading only after we got
    // the authUrl from CieId app, so the user doesn't see the login screen.
    if (isCieIdAvailable() ? !!authUrl : true) {
      setWebViewLoading(false);
    }
  }, [authUrl]);

  const onError = useCallback(() => {
    machineRef.send({ type: "error", scope: "spid-login" });
  }, [machineRef]);

  const startCieIdAppAuthentication = useCallback((url: string) => {
    // Use the new CieID app-to-app flow on Android
    if (isAndroid) {
      openCieIdApp(url, result => {
        if (result.id === "URL") {
          setAuthUrl(O.some(result.url));
        } else {
          handleAuthenticationFailure(result);
        }
      });
    }

    // Try to directly open the CieID app on iOS
    if (isIos) {
      Linking.openURL(
        `CIEID://${url}&sourceApp=${IO_LOGIN_CIE_SOURCE_APP}`
      ).catch(handleAuthenticationFailure);
    }
  }, []);

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;

      // When CieID is available, use a flow that launches the app
      if (isAuthenticationUrl(url) && isCieIdAvailable()) {
        startCieIdAppAuthentication(url);
        return false;
      }

      // When CieID is not available, revert to the regular webview
      return true;
    },
    [startCieIdAppAuthentication]
  );

  const handleNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      const authRedirectUrl = event.url;
      const isIssuanceRedirect = pipe(
        authRedirectUrl,
        O.fromNullable,
        O.fold(
          () => false,
          s => s.startsWith(itWalletIssuanceRedirectUri)
        )
      );

      if (isIssuanceRedirect) {
        machineRef.send({
          type: "spid-identification-completed",
          authRedirectUrl
        });
      }
    },
    [machineRef]
  );

  const handleAuthenticationFailure = (error: unknown) => {
    // TODO: handle error
  };

  // Setup header properties
  const headerProps: HeaderSecondLevelHookProps = {
    title: I18n.t("features.itWallet.identification.mode.title"),
    supportRequest: false
  };

  useHeaderSecondLevel(headerProps);

  const content = useMemo(
    () =>
      O.fold(
        () => null,
        (url: string) => (
          <WebView
            key={"spid_webview"}
            cacheEnabled={false}
            androidCameraAccessDisabled
            androidMicrophoneAccessDisabled
            javaScriptEnabled
            textZoom={100}
            originWhitelist={originSchemasWhiteList}
            source={{ uri: url }}
            onError={onError}
            onHttpError={onError}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoading}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction
            userAgent={defaultUserAgent}
            onLoadEnd={onLoadEnd}
          />
        )
      )(webViewSource),
    [
      webViewSource,
      handleNavigationStateChange,
      handleShouldStartLoading,
      onError,
      onLoadEnd
    ]
  );

  return (
    <LoadingSpinnerOverlay
      isLoading={isWebViewLoading || isMachineLoading}
      loadingOpacity={1.0}
    >
      <View style={styles.webViewWrapper}>{content}</View>
    </LoadingSpinnerOverlay>
  );
};

export default memo(ItwCieIdLoginScreen);
