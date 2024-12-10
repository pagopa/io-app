import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { WalletClient } from "../../common/api/client";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import {
  paymentsDeleteMethodAction,
  paymentsGetMethodDetailsAction
} from "../store/actions";

export function* handleDeleteWalletDetails(
  deleteWalletById: WalletClient["deleteIOPaymentWalletById"],
  action: ActionType<(typeof paymentsDeleteMethodAction)["request"]>
) {
  try {
    const deleteWalletResult = yield* withPaymentsSessionToken(
      deleteWalletById,
      action,
      {
        walletId: action.payload.walletId
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isRight(deleteWalletResult)) {
      if (deleteWalletResult.right.status === 204) {
        // handled success
        const successAction = paymentsDeleteMethodAction.success(
          action.payload.walletId
        );
        yield* put(successAction);
        action.payload.onSuccess?.();
        return;
      }
      if (deleteWalletResult.right.status !== 401) {
        // The 401 status is handled by the withPaymentsSessionToken
        const failureAction = paymentsDeleteMethodAction.failure({
          ...getGenericError(
            new Error(`response status code ${deleteWalletResult.right.status}`)
          )
        });
        yield* put(failureAction);
        action.payload.onFailure?.();
      }
    } else {
      // cannot decode response
      const failureAction = paymentsDeleteMethodAction.failure({
        ...getGenericError(
          new Error(readablePrivacyReport(deleteWalletResult.left))
        )
      });
      yield* put(failureAction);
      action.payload.onFailure?.();
    }
  } catch (e) {
    const failureAction = paymentsDeleteMethodAction.failure({
      ...getNetworkError(e)
    });
    yield* put(failureAction);
    yield* put(
      paymentsGetMethodDetailsAction.failure({ ...getNetworkError(e) })
    );
    action.payload.onFailure?.();
  }
}
