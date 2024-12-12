import { put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { paymentsGetMethodDetailsAction } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { mapWalletsToCards } from "../../common/utils";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetWalletDetails(
  getWalletById: WalletClient["getIOPaymentWalletById"],
  action: ActionType<(typeof paymentsGetMethodDetailsAction)["request"]>
) {
  try {
    const getWalletDetailsResult = yield* withPaymentsSessionToken(
      getWalletById,
      action,
      {
        walletId: action.payload.walletId
      },
      "pagoPAPlatformSessionToken"
    );
    if (E.isRight(getWalletDetailsResult)) {
      if (getWalletDetailsResult.right.status === 200) {
        // Upsert the card in the wallet
        yield* put(
          walletAddCards(
            mapWalletsToCards([getWalletDetailsResult.right.value])
          )
        );

        // handled success
        yield* put(
          paymentsGetMethodDetailsAction.success(
            getWalletDetailsResult.right.value
          )
        );
        return;
      }
      if (getWalletDetailsResult.right.status !== 401) {
        // The 401 status is handled by the withPaymentsSessionToken
        yield* put(
          paymentsGetMethodDetailsAction.failure({
            ...getGenericError(
              new Error(
                `response status code ${getWalletDetailsResult.right.status}`
              )
            )
          })
        );
      }
    } else {
      // cannot decode response
      yield* put(
        paymentsGetMethodDetailsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getWalletDetailsResult.left))
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetMethodDetailsAction.failure({ ...getNetworkError(e) })
    );
  }
}
