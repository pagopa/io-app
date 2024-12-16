import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
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
    React.useState<boolean>(false);
  const isLoading = pot.isLoading(authorizationUrlPot);
  const isError = pot.isError(authorizationUrlPot);

  const handleAuthorizationOutcome = React.useCallback(
    (outcome: WalletPaymentOutcome) => {
      onAuthorizationOutcome(outcome);
      dispatch(storePaymentOutcomeToHistory(outcome));
    },
    [onAuthorizationOutcome, dispatch]
  );

  const handleAuthorizationResult = React.useCallback(
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

  React.useEffect(() => {
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

  React.useEffect(
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
