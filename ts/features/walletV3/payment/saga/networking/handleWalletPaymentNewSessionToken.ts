import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentNewSessionToken } from "../../store/actions/networking";

export function* handleWalletPaymentNewSessionToken(
  newSessionToken: PaymentClient["newSessionToken"],
  action: ActionType<(typeof walletPaymentNewSessionToken)["request"]>
) {
  const newSessionTokenRequest = newSessionToken({});

  try {
    const newSessionTokenResult = (yield* call(
      withRefreshApiCall,
      newSessionTokenRequest,
      action
    )) as unknown as SagaCallReturnType<typeof newSessionToken>;

    yield* put(
      pipe(
        newSessionTokenResult,
        E.fold(
          error =>
            walletPaymentNewSessionToken.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),
          ({ status, value }) => {
            if (status === 200) {
              return walletPaymentNewSessionToken.success(value);
            } else {
              return walletPaymentNewSessionToken.failure({
                ...getGenericError(new Error(`Error: ${status}`))
              });
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentNewSessionToken.failure({ ...getNetworkError(e) }));
  }
}
