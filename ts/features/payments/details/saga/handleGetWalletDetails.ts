import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { paymentsGetMethodDetailsAction } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { walletAddCards } from "../../../newWallet/store/actions/cards";
import { mapWalletsToCards } from "../../common/utils";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetWalletDetails(
  getWalletById: WalletClient["getWalletById"],
  action: ActionType<(typeof paymentsGetMethodDetailsAction)["request"]>
) {
  try {
    const getwalletDetailsRequest = getWalletById({
      walletId: action.payload.walletId
    });
    const getWalletDetailsResult = (yield* call(
      withRefreshApiCall,
      getwalletDetailsRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getWalletById>;
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
      // not handled error codes (401 is handled by withRefreshApiCall)
      if (getWalletDetailsResult.right.status !== 401) {
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
