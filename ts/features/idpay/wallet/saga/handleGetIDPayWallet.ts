import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { idPayWalletGet } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../common/api/client";

/**
 * Handle the remote call to retrieve the IDPay wallet
 * @param getWallet
 * @param action
 */
export function* handleGetIDPayWallet(
  getWallet: IDPayClient["getWallet"],
  token: string,
  language: PreferredLanguageEnum
) {
  try {
    const getWalletResult: SagaCallReturnType<typeof getWallet> = yield* call(
      getWallet,
      {
        bearerAuth: token,
        "Accept-Language": language
      }
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
