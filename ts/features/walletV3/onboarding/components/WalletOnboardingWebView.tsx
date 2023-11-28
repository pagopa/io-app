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
import { OnboardingOutcomeFailure, OnboardingOutcomeSuccess } from "../types";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletStartOnboarding } from "../store/actions";
import { walletOnboardingStartupSelector } from "../store";
import { NetworkError } from "../../../../utils/errors";
import { WalletCreateResponse } from "../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { extractOnboardingResult } from "../utils";

type WalletOnboardingWebViewProps = {
  paymentMethodId: string;
  onSuccess: (outcome: OnboardingOutcomeSuccess, walletId: string) => void;
  onFailure: (outcome: OnboardingOutcomeFailure) => void;
  onError: (
    error: WebViewErrorEvent | WebViewHttpErrorEvent | NetworkError
  ) => void;
};

/**
 * Function that extracts the uri to be loaded in the webview from the onboarding startup result pot
 */
const extractOnboardingWebViewUri = (
  onboardingStartupResult: pot.Pot<WalletCreateResponse, NetworkError>
) =>
  pot.getOrElse(
    pot.map(onboardingStartupResult, result => encodeURI(result.redirectUrl)),
    ""
  );

/**
 * Component used to show the webview for the wallet onboarding flow
 * @param onSuccess callback called when the onboarding flow is completed successfully, when invoked can have also a walletId param
 * @param onFailure callback called when the onboarding flow is completed with a failure
 * @param onError callback called when the webview or http request encounters an error
 */
const WalletOnboardingWebView = ({
  paymentMethodId,
  onSuccess,
  onFailure,
  onError
}: WalletOnboardingWebViewProps) => {
  const [webviewReady, setWebviewReady] = React.useState<boolean>(false);
  const onboardingStartupResult = useIOSelector(
    walletOnboardingStartupSelector
  );
  const dispatch = useIODispatch();
  const isLoading = pot.isLoading(onboardingStartupResult) || !webviewReady;

  React.useEffect(() => {
    dispatch(walletStartOnboarding.request({ paymentMethodId }));
    return () => {
      dispatch(walletStartOnboarding.cancel());
    };
  }, [dispatch, paymentMethodId]);

  React.useEffect(() => {
    if (pot.isError(onboardingStartupResult)) {
      onError(onboardingStartupResult.error);
    }
  }, [onboardingStartupResult, onError]);

  const handleNavigationStateChange = (event: WebViewNavigation) => {
    pipe(
      event.url,
      extractOnboardingResult,
      O.fromNullable,
      O.map(result => {
        if (result.status === "SUCCESS") {
          onSuccess(
            result.outcome as OnboardingOutcomeSuccess,
            result.walletId
          );
        } else if (result.status === "FAILURE") {
          onFailure(result.outcome as OnboardingOutcomeFailure);
        }
      })
    );
  };

  const handleWebViewError = (
    error: WebViewErrorEvent | WebViewHttpErrorEvent
  ): void => {
    onError(error);
  };

  return (
    <View style={IOStyles.flex}>
      {isLoading && (
        <View style={styles.refreshIndicatorContainer}>
          <RefreshIndicator />
        </View>
      )}
      {!pot.isError(onboardingStartupResult) &&
        !pot.isLoading(onboardingStartupResult) && (
          <WebView
            cacheEnabled={false}
            androidCameraAccessDisabled
            androidMicrophoneAccessDisabled
            textZoom={100}
            originWhitelist={originSchemasWhiteList}
            source={{
              uri: extractOnboardingWebViewUri(onboardingStartupResult)
            }}
            onError={handleWebViewError}
            onHttpError={handleWebViewError}
            javaScriptEnabled
            onLoadEnd={() => setWebviewReady(true)}
            onNavigationStateChange={handleNavigationStateChange}
            // onShouldStartLoadWithRequest={handleShouldStartLoading}
          />
        )}
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
