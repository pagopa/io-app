import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import WebView, { WebViewNavigation } from "react-native-webview";
import { StyleSheet, View } from "react-native";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { originSchemasWhiteList } from "../../../../screens/authentication/originSchemasWhiteList";
import { RefreshIndicator } from "../../../../components/ui/RefreshIndicator";
import { OnboardingOutcome } from "../types";
import { extractOnboardingResult } from "../../../../utils/walletv3";

type WalletOnboardingWebViewProps = {
  onSuccess: (outcome: OnboardingOutcome) => void;
  onFailure: (outcome: OnboardingOutcome) => void;
  onError: (error: WebViewErrorEvent | WebViewHttpErrorEvent) => void;
};

/**
 * Component used to show the webview for the wallet onboarding flow
 * @param onSuccess callback called when the onboarding flow is completed successfully
 * @param onFailure callback called when the onboarding flow is completed with a failure
 * @param onError callback called when the webview or http request encounters an error
 */
const WalletOnboardingWebView = ({
  onSuccess,
  onFailure,
  onError
}: WalletOnboardingWebViewProps) => {
  const [webviewStatus, setWebviewStatus] = React.useState<
    pot.Pot<true, Error>
  >(pot.noneLoading);

  const handleNavigationStateChange = (event: WebViewNavigation) => {
    pipe(
      event.url,
      extractOnboardingResult,
      O.fromNullable,
      O.map(result => {
        if (result.status === "SUCCESS") {
          onSuccess(result.outcome);
        } else if (result.status === "FAILURE") {
          onFailure(result.outcome);
        }
      })
    );
  };

  const handleError = (
    error: WebViewErrorEvent | WebViewHttpErrorEvent
  ): void => {
    onError(error);
  };

  return (
    <View style={IOStyles.flex}>
      {pot.isLoading(webviewStatus) && (
        <View style={styles.refreshIndicatorContainer}>
          <RefreshIndicator />
        </View>
      )}
      <WebView
        cacheEnabled={false}
        androidCameraAccessDisabled
        androidMicrophoneAccessDisabled
        textZoom={100}
        originWhitelist={originSchemasWhiteList}
        source={{
          uri: "http://localhost:3000/onboarding-wallet"
        }}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled
        onLoadEnd={() => setWebviewStatus(pot.some(true))}
        onNavigationStateChange={handleNavigationStateChange}
        // onShouldStartLoadWithRequest={handleShouldStartLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

export default WalletOnboardingWebView;
