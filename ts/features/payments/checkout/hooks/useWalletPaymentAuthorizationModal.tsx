import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { useState, useCallback, useEffect } from "react";
import URLParse from "url-parse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import { storePaymentOutcomeToHistory } from "../../history/store/actions";
import {
  WalletPaymentAuthorizePayload,
  paymentsStartPaymentAuthorizationAction
} from "../store/actions/networking";
import { walletPaymentAuthorizationUrlSelector } from "../store/selectors/transaction";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";

type Props = {
  onAuthorizationOutcome: (outcome: WalletPaymentOutcome) => void;
};

export type WalletPaymentAuthorizationModal = {
  isLoading: boolean;
  isError: boolean;
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
        E.getOrElse(() => WalletPaymentOutcomeEnum.GENERIC_ERROR)
      );
      handleAuthorizationOutcome(outcome);
    },
    [handleAuthorizationOutcome]
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
            return openAuthenticationSession(
              url,
              WALLET_WEBVIEW_OUTCOME_SCHEMA
            );
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
    dispatch
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
