import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { NetworkError } from "../../../../utils/errors";
import {
  WalletPaymentAuthorizePayload,
  walletPaymentAuthorization
} from "../store/actions/networking";
import { walletPaymentAuthorizationUrlSelector } from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";
import { WALLET_WEBVIEW_DEEPLINK_PROTOCOL } from "../../common/utils/const";

type Props = {
  onAuthorizationOutcome: (outcome: WalletPaymentOutcome) => void;
  onError?: (
    error?: WebViewErrorEvent | WebViewHttpErrorEvent | NetworkError
  ) => void;
  onDismiss?: () => void;
};

export type WalletPaymentAuthorizationModal = {
  isLoading: boolean;
  isPendingAuthorization: boolean;
  startPaymentAuthorizaton: (payload: WalletPaymentAuthorizePayload) => void;
};

export const useWalletPaymentAuthorizationModal = ({
  onAuthorizationOutcome,
  onError,
  onDismiss
}: Props): WalletPaymentAuthorizationModal => {
  const dispatch = useIODispatch();
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );

  const isLoading = pot.isLoading(authorizationUrlPot);

  const handleAuthorizationResult = React.useCallback(
    (resultUrl: string) => {
      const outcome = pipe(
        new URLParse(resultUrl, true),
        ({ query }) => query.outcome,
        WalletPaymentOutcome.decode,
        O.fromEither,
        O.getOrElse(() => WalletPaymentOutcomeEnum.GENERIC_ERROR)
      );
      onAuthorizationOutcome(outcome);
    },
    [onAuthorizationOutcome]
  );

  React.useEffect(() => {
    if (pot.isLoading(authorizationUrlPot)) {
      return;
    }

    if (pot.isError(authorizationUrlPot)) {
      onError?.(authorizationUrlPot.error);
      return;
    }

    void pipe(
      authorizationUrlPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.chain(url =>
        TE.tryCatch(
          () =>
            openAuthenticationSession(url, WALLET_WEBVIEW_DEEPLINK_PROTOCOL),
          () => onDismiss?.()
        )
      ),
      TE.map(handleAuthorizationResult)
    )();
  }, [authorizationUrlPot, handleAuthorizationResult, onError, onDismiss]);

  React.useEffect(
    () => () => {
      dispatch(walletPaymentAuthorization.cancel());
    },
    [dispatch]
  );

  const startPaymentAuthorizaton = (payload: WalletPaymentAuthorizePayload) => {
    dispatch(walletPaymentAuthorization.request(payload));
  };

  return {
    isLoading,
    isPendingAuthorization: false,
    startPaymentAuthorizaton
  };
};
