import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayWalletGet } from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay wallet
 * @param getWallet
 * @param action
 */
export function* handleGetIDPayWallet(
  getWallet: IDPayClient["getWallet"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayWalletGet)["request"]>
) {
  const getWalletRequest = getWallet({
    bearerAuth: bearerToken,
    "Accept-Language": language
  });

  try {
    const getWalletResult = (yield* call(
      withRefreshApiCall,
      getWalletRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getWallet>;

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
