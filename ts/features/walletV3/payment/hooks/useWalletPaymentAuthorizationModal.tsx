import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import URLParse from "url-parse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import {
  WalletPaymentAuthorizePayload,
  walletPaymentAuthorization
} from "../store/actions/networking";
import { walletPaymentAuthorizationUrlSelector } from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";

type AuthorizationStatus = "IDLE" | "PENDING" | "COMPLETED" | "DISMISSED";

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

  const [authState, setAuthState] = React.useState<AuthorizationStatus>("IDLE");
  const isLoading = pot.isLoading(authorizationUrlPot);
  const isError = pot.isError(authorizationUrlPot);

  const handleAuthorizationResult = React.useCallback(
    (resultUrl: string) => {
      const outcome = pipe(
        new URLParse(resultUrl, true),
        ({ query }) => query.outcome,
        WalletPaymentOutcome.decode,
        O.fromEither,
        O.getOrElse(() => WalletPaymentOutcomeEnum.GENERIC_ERROR)
      );
      setAuthState("COMPLETED");
      onAuthorizationOutcome(outcome);
    },
    [onAuthorizationOutcome, setAuthState]
  );

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isError) {
      return;
    }

    if (authState !== "IDLE") {
      return;
    }

    void pipe(
      authorizationUrlPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.chain(url =>
        TE.tryCatch(
          () => {
            setAuthState("PENDING");
            return openAuthenticationSession(
              url,
              WALLET_WEBVIEW_OUTCOME_SCHEMA
            );
          },
          () => setAuthState("DISMISSED")
        )
      ),
      TE.map(handleAuthorizationResult)
    )();
  }, [
    isError,
    isLoading,
    authState,
    authorizationUrlPot,
    handleAuthorizationResult
  ]);

  React.useEffect(
    () => () => {
      setAuthState("IDLE");
      dispatch(walletPaymentAuthorization.cancel());
    },
    [dispatch]
  );

  const startPaymentAuthorizaton = (payload: WalletPaymentAuthorizePayload) => {
    setAuthState("IDLE");
    dispatch(walletPaymentAuthorization.request(payload));
  };

  return {
    isLoading,
    isError,
    isPendingAuthorization: authState === "PENDING",
    startPaymentAuthorizaton
  };
};
