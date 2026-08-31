import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { memo, useCallback, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../../store/hooks";
import { getIntentFallbackUrl } from "../../../../authentication/common/utils/login";
import { originSchemasWhiteList } from "../../../../authentication/common/utils/originSchemasWhiteList";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { getEnv } from "../../../common/utils/environment";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  selectAuthUrl,
  selectIsLoading,
  selectIssuanceLevel
} from "../../../machine/eid/selectors";

const styles = StyleSheet.create({
  webViewWrapper: { flex: 1 }
});

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent header.
const defaultUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

/**
 * This component renders a WebView that loads the URL obtained from the startAuthFlow.
 * It handles the navigation state changes to detect when the authentication is completed
 * and sends the redirectAuthUrl back to the state machine.
 */
const ItwSpidIdpLoginScreen = () => {
  const { ISSUANCE_REDIRECT_URI } = getEnv(useIOSelector(selectItwEnv));
  const isMachineLoading =
    ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const spidAuthUrl = ItwEidIssuanceMachineContext.useSelector(selectAuthUrl);
  const issuanceLevel =
    ItwEidIssuanceMachineContext.useSelector(selectIssuanceLevel);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const [isWebViewLoading, setWebViewLoading] = useState(true);

  const dismissalDialog = useItwDismissalDialog();

  const onLoadEnd = useCallback(() => {
    setWebViewLoading(false);
  }, []);

  const onError = useCallback(() => {
    machineRef.send({ type: "error", scope: "spid-login" });
  }, [machineRef]);

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;
      // `getIntentFallbackUrl` belongs to the authentication feature, which still returns an
      // fp-ts Option: unwrap it here, at the boundary.
      const idpIntentUrl = O.toUndefined(getIntentFallbackUrl(url));

      if (idpIntentUrl === undefined) {
        return true;
      }

      void Linking.openURL(idpIntentUrl);
      return false;
    },
    []
  );

  const handleNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      const authRedirectUrl = event.url;
      const isIssuanceRedirect =
        authRedirectUrl?.startsWith(ISSUANCE_REDIRECT_URI) ?? false;

      if (isIssuanceRedirect) {
        machineRef.send({
          type: "user-identification-completed",
          authRedirectUrl
        });
      }
    },
    [machineRef, ISSUANCE_REDIRECT_URI]
  );

  // Setup header properties
  const headerProps: HeaderSecondLevelHookProps = {
    title: I18n.t(
      issuanceLevel === "l3"
        ? "features.itWallet.identification.modeSelection.mode.spid.title.l3"
        : "features.itWallet.identification.modeSelection.mode.spid.title.default"
    ),
    supportRequest: false,
    goBack: dismissalDialog.show
  };

  useHeaderSecondLevel(headerProps);

  const content = useMemo(
    () =>
      spidAuthUrl ? (
        <WebView
          allowsInlineMediaPlayback
          androidCameraAccessDisabled
          androidMicrophoneAccessDisabled
          cacheEnabled={false}
          javaScriptEnabled
          key={"spid_webview"}
          mediaPlaybackRequiresUserAction
          onError={onError}
          onHttpError={onError}
          onLoadEnd={onLoadEnd}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoading}
          originWhitelist={originSchemasWhiteList}
          source={{ uri: spidAuthUrl }}
          textZoom={100}
          userAgent={defaultUserAgent}
        />
      ) : null,
    [
      spidAuthUrl,
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

export default memo(ItwSpidIdpLoginScreen);
