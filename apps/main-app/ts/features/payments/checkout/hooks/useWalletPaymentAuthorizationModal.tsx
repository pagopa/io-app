import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useCallback, useEffect, useState } from "react";
import URLParse from "url-parse";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPaymentsWebViewFlowEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import {
  storePaymentOutcomeToHistory,
  storePaymentsBrowserTypeAction
} from "../../history/store/actions";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  paymentsStartPaymentAuthorizationAction,
  WalletPaymentAuthorizePayload
} from "../store/actions/networking";
import { paymentStartWebViewFlow } from "../store/actions/orchestration";
import { walletPaymentAuthorizationUrlSelector } from "../store/selectors/transaction";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";

type Props = {
  onAuthorizationOutcome: (outcome: WalletPaymentOutcome) => void;
};

type WalletPaymentAuthorizationModal = {
  isError: boolean;
  isLoading: boolean;
  isPendingAuthorization: boolean;
  startPaymentAuthorizaton: (payload: WalletPaymentAuthorizePayload) => void;
};

export const useWalletPaymentAuthorizationModal = ({
  onAuthorizationOutcome
}: Props): WalletPaymentAuthorizationModal => {
  const dispatch = useIODispatch();

  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );
  const [isPendingAuthorization, setIsPendingAuthorization] =
    useState<boolean>(false);
  const isLoading = pot.isLoading(authorizationUrlPot);
  const isError = pot.isError(authorizationUrlPot);

  const navigation = useIONavigation();

  const isWebViewEnabled = useIOSelector(isPaymentsWebViewFlowEnabledSelector);

  const handleAuthorizationOutcome = useCallback(
    (outcome: WalletPaymentOutcome) => {
      onAuthorizationOutcome(outcome);
      dispatch(storePaymentOutcomeToHistory(outcome));
    },
    [onAuthorizationOutcome, dispatch]
  );

  const handleAuthorizationResult = useCallback(
    (resultUrl: string) => {
      const outcome = pipe(
        new URLParse(resultUrl, true),
        ({ query }) => query.outcome,
        WalletPaymentOutcome.decode,
        E.fold(
          () => WalletPaymentOutcomeEnum.GENERIC_ERROR,
          decodedOutcome => decodedOutcome
        )
      );
      handleAuthorizationOutcome(outcome);
    },
    [handleAuthorizationOutcome]
  );

  const startWebviewPaymentSession = useCallback(
    (url: string): Promise<string> =>
      new Promise((resolve, reject) => {
        dispatch(storePaymentsBrowserTypeAction("webview"));
        navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
          screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_WEB_VIEW
        });
        dispatch(
          paymentStartWebViewFlow({
            url,
            onSuccess: resolve,
            onError: reject,
            onCancel: reject
          })
        );
      }),
    [dispatch, navigation]
  );

  const startInAppBrowserPaymentSession = useCallback(
    (url: string) => {
      dispatch(storePaymentsBrowserTypeAction("inapp_browser"));
      return openAuthenticationSession(url, WALLET_WEBVIEW_OUTCOME_SCHEMA);
    },
    [dispatch]
  );

  useEffect(() => {
    if (isPendingAuthorization) {
      return;
    }

    void pipe(
      authorizationUrlPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.chain(url =>
        TE.tryCatch(
          () => {
            setIsPendingAuthorization(true);
            return isWebViewEnabled
              ? startWebviewPaymentSession(url)
              : startInAppBrowserPaymentSession(url);
          },
          () => {
            handleAuthorizationOutcome(
              WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER
            );
          }
        )
      ),
      TE.map(handleAuthorizationResult)
    )();
  }, [
    isError,
    isLoading,
    isPendingAuthorization,
    authorizationUrlPot,
    handleAuthorizationResult,
    handleAuthorizationOutcome,
    dispatch,
    isWebViewEnabled,
    startWebviewPaymentSession,
    startInAppBrowserPaymentSession
  ]);

  useEffect(
    () => () => {
      setIsPendingAuthorization(false);
      dispatch(paymentsStartPaymentAuthorizationAction.cancel());
    },
    [dispatch]
  );

  const startPaymentAuthorizaton = (payload: WalletPaymentAuthorizePayload) => {
    setIsPendingAuthorization(false);
    dispatch(paymentsStartPaymentAuthorizationAction.request(payload));
  };

  return {
    isLoading,
    isError,
    isPendingAuthorization,
    startPaymentAuthorizaton
  };
};
