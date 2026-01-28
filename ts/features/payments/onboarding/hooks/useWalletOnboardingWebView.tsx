import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import URLParse from "url-parse";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsCheckoutRoutes } from "../../checkout/navigation/routes";
import * as analytics from "../analytics";
import {
  contextualOnboardingStartWebViewFlow,
  paymentsStartOnboardingAction
} from "../store/actions";
import { selectPaymentOnboardingRequestResult } from "../store/selectors";
import { storePaymentIsOnboardedAction } from "../../history/store/actions";
import {
  WalletOnboardingOutcome,
  WalletOnboardingOutcomeEnum
} from "../types/OnboardingOutcomeEnum";
import { ONBOARDING_CALLBACK_URL_SCHEMA } from "../utils";

export type WalletOnboardingOutcomeParams = {
  outcome: WalletOnboardingOutcome;
  walletId?: string;
  orderId?: string;
  transactionId?: string;
};

type WalletOnboardingWebViewProps = {
  onOnboardingOutcome: (params: WalletOnboardingOutcomeParams) => void;
};

type WalletOnboardingWebView = {
  isLoading: boolean;
  isError: boolean;
  isPendingOnboarding: boolean;
  startOnboarding: (paymentMethodId: string) => void;
  startContextualOnboarding: (url: string) => void;
};

/**
 * This hook handles the onboarding webview flow and returns a function to start the onboarding
 * @param onOnboardingOutcome callback called when the onboarding flow is completed
 */
export const useWalletOnboardingWebView = ({
  onOnboardingOutcome
}: WalletOnboardingWebViewProps): WalletOnboardingWebView => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const onboardingUrlPot = useIOSelector(selectPaymentOnboardingRequestResult);

  const [isPendingOnboarding, setIsPendingOnboarding] =
    useState<boolean>(false);
  const isLoading = pot.isLoading(onboardingUrlPot);
  const isError = pot.isError(onboardingUrlPot);

  const startWebviewContextualOnboardingSession = useCallback(
    (url: string): Promise<string> =>
      new Promise((resolve, reject) => {
        navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
          screen: PaymentsCheckoutRoutes.PAYMENT_ONBOARDING_WEB_VIEW
        });
        dispatch(
          contextualOnboardingStartWebViewFlow({
            url,
            onSuccess: resolve,
            onError: reject,
            onCancel: reject
          })
        );
      }),
    [dispatch, navigation]
  );

  const handleOnboardingResult = useCallback(
    (resultUrl: string) => {
      const url = new URLParse(resultUrl, true);

      const outcome = pipe(
        url.query.outcome,
        WalletOnboardingOutcome.decode,
        E.fold(
          () => WalletOnboardingOutcomeEnum.GENERIC_ERROR,
          decodedOutcome => decodedOutcome
        )
      );

      const is_onboarded = !!url.query.transactionId;

      dispatch(storePaymentIsOnboardedAction(is_onboarded));

      analytics.trackPaymentOnboardingContextualCard({
        is_onboarded
      });

      onOnboardingOutcome({
        outcome,
        walletId: url.query.walletId,
        orderId: url.query.orderId,
        transactionId: url.query.transactionId
      });
    },
    [onOnboardingOutcome, dispatch]
  );

  const openBrowserSessionOnboarding = useCallback(
    async (url: string) => {
      try {
        const result =
          Platform.OS === "ios"
            ? await openAuthenticationSession(
                url,
                ONBOARDING_CALLBACK_URL_SCHEMA
              )
            : await startWebviewContextualOnboardingSession(url);
        handleOnboardingResult(result);
      } catch {
        onOnboardingOutcome({
          outcome: WalletOnboardingOutcomeEnum.CANCELED_BY_USER
        });
      }
    },
    [
      onOnboardingOutcome,
      handleOnboardingResult,
      startWebviewContextualOnboardingSession
    ]
  );

  useEffect(() => {
    if (isPendingOnboarding) {
      return;
    }

    void pipe(
      onboardingUrlPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.map(({ redirectUrl }) => {
        void openBrowserSessionOnboarding(redirectUrl);
      })
    )();
  }, [isPendingOnboarding, onboardingUrlPot, openBrowserSessionOnboarding]);

  useEffect(
    () => () => {
      setIsPendingOnboarding(false);
      dispatch(paymentsStartOnboardingAction.cancel());
    },
    [dispatch]
  );

  const startOnboarding = (paymentMethodId: string) => {
    setIsPendingOnboarding(false);
    dispatch(paymentsStartOnboardingAction.request({ paymentMethodId }));
  };

  const startContextualOnboarding = async (url: string) => {
    setIsPendingOnboarding(false);
    await openBrowserSessionOnboarding(url);
  };

  return {
    startOnboarding,
    startContextualOnboarding,
    isLoading,
    isError,
    isPendingOnboarding
  };
};
