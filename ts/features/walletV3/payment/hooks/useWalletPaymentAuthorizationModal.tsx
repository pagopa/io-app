import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import URLParse from "url-parse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletAnalyticsResetPaymentTentative } from "../../analytics/store/actions";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import {
  WalletPaymentAuthorizePayload,
  walletPaymentAuthorization
} from "../store/actions/networking";
import {
  walletPaymentAuthorizationUrlSelector,
  walletPaymentDetailsSelector
} from "../store/selectors";
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

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );

  const [isPendingAuthorization, setIsPendingAuthorization] =
    React.useState<boolean>(false);
  const isLoading = pot.isLoading(authorizationUrlPot);
  const isError = pot.isError(authorizationUrlPot);

  const resetPaymentTentativeOnSuccess = React.useCallback(
    (outcome: WalletPaymentOutcomeEnum) => {
      // If the outcome is SUCCESS, reset the payment tentative in the store
      if (outcome === WalletPaymentOutcomeEnum.SUCCESS) {
        pipe(
          paymentDetailsPot,
          pot.toOption,
          O.map(({ rptId }) => rptId),
          O.map(walletAnalyticsResetPaymentTentative),
          O.map(dispatch)
        );
      }
    },
    [dispatch, paymentDetailsPot]
  );

  const handleAuthorizationResult = React.useCallback(
    (resultUrl: string) => {
      const outcome = pipe(
        new URLParse(resultUrl, true),
        ({ query }) => query.outcome,
        WalletPaymentOutcome.decode,
        E.getOrElse(() => WalletPaymentOutcomeEnum.GENERIC_ERROR)
      );
      resetPaymentTentativeOnSuccess(outcome);
      onAuthorizationOutcome(outcome);
    },
    [onAuthorizationOutcome, resetPaymentTentativeOnSuccess]
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
            dispatch(walletPaymentAuthorization.cancel());
            setIsPendingAuthorization(false);
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
    dispatch
  ]);

  React.useEffect(
    () => () => {
      setIsPendingAuthorization(false);
      dispatch(walletPaymentAuthorization.cancel());
    },
    [dispatch]
  );

  const startPaymentAuthorizaton = (payload: WalletPaymentAuthorizePayload) => {
    setIsPendingAuthorization(false);
    dispatch(walletPaymentAuthorization.request(payload));
  };

  return {
    isLoading,
    isError,
    isPendingAuthorization,
    startPaymentAuthorizaton
  };
};
