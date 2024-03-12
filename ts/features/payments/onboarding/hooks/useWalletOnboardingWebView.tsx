import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import { OnboardingOutcomeFailure, OnboardingOutcomeSuccess } from "../types";
import { NetworkError } from "../../../../utils/errors";
import { WalletCreateResponse } from "../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletOnboardingStartupSelector } from "../store";
import { walletStartOnboarding } from "../store/actions";
import {
  ONBOARDING_CALLBACK_URL_SCHEMA,
  extractOnboardingResult
} from "../utils";

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

export type WalletOnboardingWebViewProps = {
  onSuccess?: (outcome: OnboardingOutcomeSuccess, walletId: string) => void;
  onFailure?: (outcome: OnboardingOutcomeFailure) => void;
  onError?: (
    error?: WebViewErrorEvent | WebViewHttpErrorEvent | NetworkError
  ) => void;
  onDismiss?: () => void;
};

/**
 * This hook handles the onboarding webview flow and returns a function to start the onboarding
 * @param onSuccess callback called when the onboarding is successful
 * @param onFailure callback called when the onboarding is failed
 * @param onError callback called when an error occurs
 */
export const useWalletOnboardingWebView = (
  props: WalletOnboardingWebViewProps
) => {
  const { onSuccess, onError, onFailure, onDismiss } = props;
  const [isLoadingWebView, setIsLoadingWebView] = React.useState(false);
  const onboardingStartupResult = useIOSelector(
    walletOnboardingStartupSelector
  );
  const dispatch = useIODispatch();

  const handleResultOnboarding = React.useCallback(
    (url: string) => {
      pipe(
        url,
        extractOnboardingResult,
        O.fromNullable,
        O.map(result => {
          if (result.status === "SUCCESS") {
            onSuccess?.(
              result.outcome as OnboardingOutcomeSuccess,
              result.walletId
            );
          } else if (result.status === "FAILURE") {
            onFailure?.(result.outcome as OnboardingOutcomeFailure);
          }
        })
      );
    },
    [onSuccess, onFailure]
  );

  const openOnboardingWebView = React.useCallback(async () => {
    try {
      const resultUrl = await openAuthenticationSession(
        extractOnboardingWebViewUri(onboardingStartupResult),
        ONBOARDING_CALLBACK_URL_SCHEMA
      );
      handleResultOnboarding(resultUrl);
    } catch (err) {
      onDismiss?.();
    } finally {
      setIsLoadingWebView(false);
    }
  }, [onboardingStartupResult, handleResultOnboarding, onDismiss]);

  React.useEffect(
    () => () => {
      dispatch(walletStartOnboarding.cancel());
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (pot.isError(onboardingStartupResult) && onError) {
      onError(onboardingStartupResult.error);
    }
    if (
      !pot.isError(onboardingStartupResult) &&
      !pot.isLoading(onboardingStartupResult)
    ) {
      void openOnboardingWebView();
    }
  }, [onboardingStartupResult, openOnboardingWebView, onError]);

  const startOnboarding = (paymentMethodId: string) => {
    if (!pot.isLoading(onboardingStartupResult) && !isLoadingWebView) {
      setIsLoadingWebView(true);
      dispatch(walletStartOnboarding.request({ paymentMethodId }));
    }
  };

  return {
    startOnboarding,
    isLoadingWebView
  };
};
