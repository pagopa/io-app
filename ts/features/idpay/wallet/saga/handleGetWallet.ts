import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { handleRemoveMissingCards } from "../../../wallet/saga/handleRemoveMissingCards";
import { walletAddCards } from "../../../wallet/store/actions/cards";
import { IDPayClient } from "../../common/api/client";
import { idPayWalletGet } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

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
        const initiatives = getWalletResult.right.value;
        yield* put(
          walletAddCards(
            initiatives.initiativeList.map(initiative => ({
              type: "idPay",
              category: "bonus",
              key: `idpay_${initiative.initiativeId}`,
              initiativeId: initiative.initiativeId,
              name: initiative.initiativeName || "",
              amount: initiative.amountCents || 0,
              avatarSource: {
                uri: initiative.logoURL
              },
              expireDate: initiative.voucherEndDate || new Date()
            }))
          )
        );
        // Create set of keys from latest API response and remove stored cards
        const newKeys = new Set(
          initiatives.initiativeList.map(
            initiative => `idpay_${initiative.initiativeId}`
          )
        );

        yield* handleRemoveMissingCards(newKeys, "idPay");

        yield* put(idPayWalletGet.success(initiatives));
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
