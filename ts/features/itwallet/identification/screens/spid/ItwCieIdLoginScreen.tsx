import React, { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
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
import { isAndroid } from "../../../../../utils/platform";

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

  const canUseCieIdApp2AppFlow = useMemo(
    () => isAndroid && isCieIdAvailable(),
    []
  );

  const onLoadEnd = useCallback(() => {
    // When CieId app-to-app flow is enabled, stop loading only after we got
    // the authUrl from CieId app, so the user doesn't see the login screen.
    if (canUseCieIdApp2AppFlow ? authUrl : true) {
      setWebViewLoading(false);
    }
  }, [canUseCieIdApp2AppFlow, authUrl]);

  const onError = useCallback(() => {
    machineRef.send({ type: "error", scope: "spid-login" });
  }, [machineRef]);

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;

      if (canUseCieIdApp2AppFlow && isAuthenticationUrl(url)) {
        openCieIdApp(url, result => {
          if (result.id === "URL") {
            setAuthUrl(O.some(result.url));
          } else {
            machineRef.send({ type: "back" });
          }
        });
        return false;
      }

      return true;
    },
    [canUseCieIdApp2AppFlow, machineRef]
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
