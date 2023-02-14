import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayClient } from "../../../common/api/client";
import {
  idpayInitiativeGet,
  IdPayInitiativeGetPayloadType
} from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getInitiativeDetails
 * @param action
 * @param initiativeId
 */

export function* handleGetInitiativeDetails(
  getInitiativeDetails: IDPayClient["getWalletDetail"],
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
    yield pipe(
      getInitiativeDetailsResult,
      E.fold(
        error =>
          put(
            idpayInitiativeGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayInitiativeGet.success(response.value)
              : idpayInitiativeGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idpayInitiativeGet.failure({ ...getNetworkError(e) }));
  }
}
