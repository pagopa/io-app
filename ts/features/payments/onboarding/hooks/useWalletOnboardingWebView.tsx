import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import URLParse from "url-parse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletOnboardingStartupSelector } from "../store";
import { walletStartOnboarding } from "../store/actions";
import {
  WalletOnboardingOutcome,
  WalletOnboardingOutcomeEnum
} from "../types/OnboardingOutcomeEnum";
import { ONBOARDING_CALLBACK_URL_SCHEMA } from "../utils";

type WalletOnboardingWebViewProps = {
  onOnboardingOutcome: (
    outcome: WalletOnboardingOutcome,
    walletId?: string
  ) => void;
};

export type WalletOnboardingWebView = {
  isLoading: boolean;
  isError: boolean;
  isPendingOnboarding: boolean;
  startOnboarding: (paymentMethodId: string) => void;
};

/**
 * This hook handles the onboarding webview flow and returns a function to start the onboarding
 * @param onOnboardingOutcome callback called when the onboarding flow is completed
 */
export const useWalletOnboardingWebView = ({
  onOnboardingOutcome
}: WalletOnboardingWebViewProps): WalletOnboardingWebView => {
  const dispatch = useIODispatch();

  const onboardingUrlPot = useIOSelector(walletOnboardingStartupSelector);

  const [isPendingOnboarding, setIsPendingOnboarding] =
    React.useState<boolean>(false);
  const isLoading = pot.isLoading(onboardingUrlPot);
  const isError = pot.isError(onboardingUrlPot);

  const handleOnboardingResult = React.useCallback(
    (resultUrl: string) => {
      const url = new URLParse(resultUrl, true);

      const outcome = pipe(
        url.query.outcome,
        WalletOnboardingOutcome.decode,
        E.getOrElse(() => WalletOnboardingOutcomeEnum.GENERIC_ERROR)
      );

      onOnboardingOutcome(outcome, url.query.walletId);
    },
    [onOnboardingOutcome]
  );

  React.useEffect(() => {
    if (isPendingOnboarding) {
      return;
    }

    void pipe(
      onboardingUrlPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.chain(({ redirectUrl }) =>
        TE.tryCatch(
          () => {
            setIsPendingOnboarding(true);
            return openAuthenticationSession(
              redirectUrl,
              ONBOARDING_CALLBACK_URL_SCHEMA
            );
          },
          () => {
            onOnboardingOutcome(WalletOnboardingOutcomeEnum.CANCELED_BY_USER);
          }
        )
      ),
      TE.map(handleOnboardingResult)
    )();
  }, [
    isError,
    isLoading,
    isPendingOnboarding,
    onboardingUrlPot,
    handleOnboardingResult,
    onOnboardingOutcome,
    dispatch
  ]);

  React.useEffect(
    () => () => {
      dispatch(walletStartOnboarding.cancel());
    },
    [dispatch]
  );

  const startOnboarding = (paymentMethodId: string) => {
    setIsPendingOnboarding(false);
    dispatch(walletStartOnboarding.request({ paymentMethodId }));
  };

  return {
    startOnboarding,
    isLoading,
    isError,
    isPendingOnboarding
  };
};
