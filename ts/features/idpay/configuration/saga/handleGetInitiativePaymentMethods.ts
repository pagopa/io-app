import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayDiscountInitiativeInstrumentsGet } from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative associated payment methods for discount initiatives
 * @param getInitiativePaymentMethods BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetInitiativePaymentMethods(
  getInitiativePaymentMethods: IDPayClient["getInstrumentList"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<typeof idpayDiscountInitiativeInstrumentsGet["request"]>
) {
  const getInitiativeDetailsRequest = getInitiativePaymentMethods({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const getInitiativePaymentMethodsResult = (yield* call(
      withRefreshApiCall,
      getInitiativeDetailsRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getInitiativePaymentMethods>;

    yield pipe(
      getInitiativePaymentMethodsResult,
      E.fold(
        error =>
          put(
            idpayDiscountInitiativeInstrumentsGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayDiscountInitiativeInstrumentsGet.success(response.value)
              : idpayDiscountInitiativeInstrumentsGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(
      idpayDiscountInitiativeInstrumentsGet.failure({ ...getNetworkError(e) })
    );
  }
}
