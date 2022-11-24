import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayWalletClient } from "../../../wallet/api/client";
import { idpayInitiativeGet, IdPayInitiativeGetPayloadType } from "../store";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getInitiativeDetails
 * @param action
 * @param initiativeId
 */

export function* handleGetInitiativeDetails(
  getInitiativeDetails: IDPayWalletClient["getWalletDetail"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayInitiativeGetPayloadType
) {
  try {
    const getInitiativeDetailsResult: SagaCallReturnType<
      typeof getInitiativeDetails
    > = yield* call(getInitiativeDetails, {
      bearerAuth: token,
      "Accept-Language": language,
      initiativeId: payload.initiativeId
    });

    if (E.isRight(getInitiativeDetailsResult)) {
      if (getInitiativeDetailsResult.right.status === 200) {
        // handled success
        yield* put(
          idpayInitiativeGet.success(getInitiativeDetailsResult.right.value)
        );
        return;
      }
      // not handled error codes
      yield* put(
        idpayInitiativeGet.failure({
          ...getGenericError(
            new Error(
              `response status code ${getInitiativeDetailsResult.right.status}`
            )
          )
        })
      );
    } else {
      // cannot decode response
      yield* put(
        idpayInitiativeGet.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getInitiativeDetailsResult.left))
          )
        })
      );
    }
  } catch (e) {
    yield* put(idpayInitiativeGet.failure({ ...getGenericError(e) }));
  }
}
