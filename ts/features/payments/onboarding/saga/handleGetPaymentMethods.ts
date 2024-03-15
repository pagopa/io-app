import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { WalletClient } from "../../common/api/client";
import { walletGetPaymentMethods } from "../store/actions";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetPaymentMethods(
  getPaymentMethods: WalletClient["getAllPaymentMethods"],
  action: ActionType<(typeof walletGetPaymentMethods)["request"]>
) {
  try {
    const getPaymentMethodsRequest = getPaymentMethods({});

    const getPaymentMethodsResult = (yield* call(
      withRefreshApiCall,
      getPaymentMethodsRequest,
      action
    )) as SagaCallReturnType<typeof getPaymentMethods>;

    yield* pipe(
      getPaymentMethodsResult,
      E.fold(
        function* (error) {
          yield* put(
            walletGetPaymentMethods.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletGetPaymentMethods.success(value));
              break;
            default:
              yield* put(
                walletGetPaymentMethods.failure(
                  getGenericError(new Error(`response status code ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletGetPaymentMethods.failure({ ...getNetworkError(e) }));
  }
}
