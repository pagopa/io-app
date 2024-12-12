import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import * as t from "io-ts";
import {
  CieIdErrorResult,
  isCieIdAvailable,
  openCieIdApp
} from "@pagopa/io-react-native-cieid";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { selectAuthUrlOption } from "../../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import I18n from "../../../../../i18n";
import { originSchemasWhiteList } from "../../../../../screens/authentication/originSchemasWhiteList";
import { itWalletIssuanceRedirectUri } from "../../../../../config";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { isAndroid, isIos } from "../../../../../utils/platform";
import { convertUnknownToError } from "../../../../../utils/errors";
import {
  CIE_ID_ERROR,
  CIE_ID_ERROR_MESSAGE,
  IO_LOGIN_CIE_SOURCE_APP,
  IO_LOGIN_CIE_URL_SCHEME
} from "../../../../../utils/cie";

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent header.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

const styles = StyleSheet.create({
  webViewWrapper: { flex: 1 }
});

const cieIdAppError = t.type({
  id: t.literal("ERROR"),
  code: t.string
});

const isAuthenticationUrl = (url: string) => {
  const authUrlRegex = /\/(livello1|livello2|nextUrl|openApp)(\/|\?|$)/;
  return authUrlRegex.test(url);
};

const isCieIdAppError = (e: unknown): e is CieIdErrorResult =>
  cieIdAppError.is(e);

const extractCieIdErrorFromUrl = (url: string) =>
  pipe(
    url,
    O.fromPredicate(x => x.includes(CIE_ID_ERROR)),
    O.map(
      x => x.split(CIE_ID_ERROR_MESSAGE)[1] ?? "Unexpected error from CieID"
    ),
    O.toUndefined
  );

/**
 * This component renders a WebView that loads the URL obtained from the startAuthFlow.
 * It handles the navigation state changes to detect when the authentication is completed
 * and sends the redirectAuthUrl back to the state machine.
 */
const ItwCieIdLoginScreen = () => {
  const cieIdAuthUrl =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const [isWebViewLoading, setWebViewLoading] = useState(true);

  const [cancelVisible, setCancelVisible] = useState(false);
  const [authUrl, setAuthUrl] = useState<O.Option<string>>();
  const webViewSource = authUrl || cieIdAuthUrl;

  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.identification.mode.title"),
    supportRequest: false
  });

  const sendErrorToMachine = useCallback(
    (error: Error) => {
      machineRef.send({ type: "error", scope: "cieid-login", error });
    },
    [machineRef]
  );

  useEffect(() => {
    const urlListenerSubscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        if (!url.startsWith(IO_LOGIN_CIE_URL_SCHEME)) {
          return;
        }

        const [, continueUrl] = url.split(IO_LOGIN_CIE_URL_SCHEME);
        const cieIdError = extractCieIdErrorFromUrl(continueUrl);

        if (cieIdError) {
          return sendErrorToMachine(new Error(cieIdError));
        }

        setAuthUrl(O.some(continueUrl));
        setCancelVisible(false);
      }
    );

    return () => urlListenerSubscription.remove();
  }, [sendErrorToMachine]);

  const onLoadEnd = useCallback(() => {
    // When CieId app-to-app flow is enabled, stop loading only after we got
    // the authUrl from CieId app, so the user doesn't see the login screen.
    if (isCieIdAvailable() ? !!authUrl : true) {
      setWebViewLoading(false);
    }
  }, [authUrl]);

  const goBack = useCallback(
    () => machineRef.send({ type: "back" }),
    [machineRef]
  );

  const handleAuthenticationFailure = useCallback(
    (error: unknown) => {
      if (isCieIdAppError(error)) {
        return error.code === "CIEID_OPERATION_CANCEL"
          ? goBack()
          : sendErrorToMachine(new Error(error.code));
      }

      sendErrorToMachine(convertUnknownToError(error));
    },
    [sendErrorToMachine, goBack]
  );

  const startCieIdAppAuthentication = useCallback(
    (url: string) => {
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
        Linking.openURL(`CIEID://${url}&sourceApp=${IO_LOGIN_CIE_SOURCE_APP}`)
          .then(() => setCancelVisible(true))
          .catch(handleAuthenticationFailure);
      }
    },
    [handleAuthenticationFailure]
  );

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
          type: "user-identification-completed",
          authRedirectUrl
        });
      }
    },
    [machineRef]
  );

  const content = useMemo(
    () =>
      O.fold(
        () => null,
        (url: string) => (
          <WebView
            key="cieid_webview"
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
        )
      )(webViewSource),
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
      onCancel={cancelVisible ? goBack : undefined} // This should only be possible when opening CieID through the Linking module
    >
      <View style={styles.webViewWrapper}>{content}</View>
    </LoadingSpinnerOverlay>
  );
};

export default memo(ItwCieIdLoginScreen);
