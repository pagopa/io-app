import { isCieIdAvailable } from "@pagopa/io-react-native-cieid";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../../store/hooks";
import { originSchemasWhiteList } from "../../../../authentication/common/utils/originSchemasWhiteList";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { getEnv } from "../../../common/utils/environment";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectAuthUrlOption } from "../../../machine/eid/selectors";
import { useCieIdApp } from "../hooks/useCieIdApp";

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent header.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

const styles = StyleSheet.create({
  webViewWrapper: { flex: 1 }
});

const isAuthenticationUrl = (url: string) => {
  const authUrlRegex = /\/(livello[123]|nextUrl|openApp|app)(\/|\?|$)/;
  return authUrlRegex.test(url);
};

/**
 * This component renders a WebView that loads the URL obtained from the startAuthFlow.
 * It handles the navigation state changes to detect when the authentication is completed
 * and sends the redirectAuthUrl back to the state machine.
 */
const ItwCieIdLoginScreen = () => {
  const { ISSUANCE_REDIRECT_URI } = pipe(useIOSelector(selectItwEnv), getEnv);

  const initialAuthUrl =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const [isWebViewLoading, setWebViewLoading] = useState(true);

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "back" })
  });

  const {
    authUrl,
    isAppLaunched,
    startCieIdAppAuthentication,
    handleAuthenticationFailure
  } = useCieIdApp();

  const webViewSource = pipe(
    authUrl,
    O.alt(() => initialAuthUrl)
  );

  useHeaderSecondLevel({
    title: I18n.t(
      "features.itWallet.identification.modeSelection.mode.cieId.title"
    ),
    supportRequest: false,
    goBack: dismissalDialog.show
  });

  const onLoadEnd = useCallback(() => {
    // When CieId app-to-app flow is enabled, stop loading only after we got
    // the authUrl from CieId app, so the user doesn't see the login screen.
    if (isCieIdAvailable() ? !!authUrl : true) {
      setWebViewLoading(false);
    }
  }, [authUrl]);

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;

      // When CieID is available, use a flow that launches the app
      if (isAuthenticationUrl(url) && isCieIdAvailable()) {
        startCieIdAppAuthentication(url);
        return false;
      }

      // When CieID is not available, fallback to the regular webview
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
          s => s.startsWith(ISSUANCE_REDIRECT_URI)
        )
      );

      if (isIssuanceRedirect) {
        machineRef.send({
          type: "user-identification-completed",
          authRedirectUrl
        });
      }
    },
    [machineRef, ISSUANCE_REDIRECT_URI]
  );

  const content = useMemo(
    () =>
      pipe(
        webViewSource,
        O.fold(constNull, (url: string) => (
          <WebView
            testID="cieid-webview"
            cacheEnabled={false}
            androidCameraAccessDisabled
            androidMicrophoneAccessDisabled
            javaScriptEnabled
            textZoom={100}
            originWhitelist={originSchemasWhiteList}
            source={{ uri: url }}
            onError={handleAuthenticationFailure}
            onHttpError={handleAuthenticationFailure}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoading}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction
            userAgent={defaultUserAgent}
            onLoadEnd={onLoadEnd}
          />
        ))
      ),
    [
      webViewSource,
      handleNavigationStateChange,
      handleShouldStartLoading,
      handleAuthenticationFailure,
      onLoadEnd
    ]
  );

  return (
    <LoadingSpinnerOverlay
      isLoading={isWebViewLoading}
      loadingOpacity={1.0}
      onCancel={isAppLaunched ? dismissalDialog.show : undefined} // This should only be possible when opening CieID through the Linking module
    >
      <View style={styles.webViewWrapper}>{content}</View>
    </LoadingSpinnerOverlay>
  );
};

export default memo(ItwCieIdLoginScreen);
