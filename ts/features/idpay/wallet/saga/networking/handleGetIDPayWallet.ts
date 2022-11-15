import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../../types/utils";
import { IDPayWalletClient } from "../../api/client";
import { idPayWalletGet } from "../../store/actions";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";

/**
 * Handle the remote call to retrieve the IDPay wallet
 * @param getWallet
 * @param action
 */
export function* handleGetIDPayWallet(
  getWallet: IDPayWalletClient["getWallet"]
) {
  try {
    const getWalletResult: SagaCallReturnType<typeof getWallet> = yield* call(
      getWallet,
      {}
    );
    if (E.isRight(getWalletResult)) {
      if (getWalletResult.right.status === 200) {
        // handled success
        yield* put(idPayWalletGet.success(getWalletResult.right.value));
        return;
      }
      // not handled error codes
      yield* put(
        idPayWalletGet.failure({
          ...getGenericError(
            new Error(`response status code ${getWalletResult.right.status}`)
          )
        })
      );
    } else {
      // cannot decode response
      yield* put(
        idPayWalletGet.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getWalletResult.left))
          )
        })
      );
    }
  } catch (e) {
    yield* put(idPayWalletGet.failure({ ...getNetworkError(e) }));
  }
}
