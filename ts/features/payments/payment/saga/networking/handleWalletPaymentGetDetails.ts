import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentGetDetails } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentGetDetails(
  getPaymentRequestInfo: PaymentClient["getPaymentRequestInfo"],
  action: ActionType<(typeof walletPaymentGetDetails)["request"]>
) {
  try {
    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        walletPaymentGetDetails.failure(
          getGenericError(new Error(`Missing session token`))
        )
      );
      return;
    }

    const getPaymentRequestInfoRequest = getPaymentRequestInfo({
      rpt_id: action.payload,
      eCommerceSessionToken: sessionToken
    });

    const getPaymentRequestInfoResult = (yield* call(
      withRefreshApiCall,
      getPaymentRequestInfoRequest,
      action
    )) as SagaCallReturnType<typeof getPaymentRequestInfo>;

    yield* pipe(
      getPaymentRequestInfoResult,
      E.fold(
        function* (error) {
          yield* put(
            walletPaymentGetDetails.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletPaymentGetDetails.success(value));
              break;
            case 400:
              yield* put(
                walletPaymentGetDetails.failure(
                  getGenericError(new Error(`Error: ${status}`))
                )
              );
              break;
            default:
              yield* put(walletPaymentGetDetails.failure(value));
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletPaymentGetDetails.failure(getNetworkError(e)));
  }
}
