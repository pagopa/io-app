import React, { memo, useCallback, useMemo } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  selectAuthUrlOption,
  selectIsLoading
} from "../../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../../i18n";
import { originSchemasWhiteList } from "../../../../../screens/authentication/originSchemasWhiteList";
import { itWalletIssuanceRedirectUri } from "../../../../../config";
import { getIntentFallbackUrl } from "../../../../../utils/login";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";

const styles = StyleSheet.create({
  webViewWrapper: { flex: 1 }
});

const LoadingSpinner = (
  <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
);

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent header.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

/**
 * This component renders a WebView that loads the URL obtained from the startAuthFlow.
 * It handles the navigation state changes to detect when the authentication is completed
 * and sends the redirectAuthUrl back to the state machine.
 */
const ItwSpidIdpLoginScreen = () => {
  const isMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const spidAuthUrl =
    ItwEidIssuanceMachineContext.useSelector(selectAuthUrlOption);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const onError = useCallback(() => {
    machineRef.send({ type: "error", scope: "spid-login" });
  }, [machineRef]);

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;
      const idpIntent = getIntentFallbackUrl(url);

      return pipe(
        idpIntent,
        O.fold(
          () => true,
          intentUrl => {
            void Linking.openURL(intentUrl);
            return false;
          }
        )
      );
    },
    []
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
        () => LoadingSpinner,
        (url: string) => (
          <WebView
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
          />
        )
      )(spidAuthUrl),
    [
      spidAuthUrl,
      handleNavigationStateChange,
      handleShouldStartLoading,
      onError
    ]
  );

  if (isMachineLoading) {
    return LoadingSpinner;
  }

  return <View style={styles.webViewWrapper}>{content}</View>;
};

export default memo(ItwSpidIdpLoginScreen);
