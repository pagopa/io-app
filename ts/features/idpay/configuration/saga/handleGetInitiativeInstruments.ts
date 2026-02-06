import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, delay, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayInitiativeInstrumentsGet } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

/**
 * Handle the remote call to retrieve the IDPay initiative associated payment methods for initiatives
 * @param getInitiativePaymentMethods BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetInitiativeInstruments(
  getInitiativePaymentMethods: IDPayClient["getInstrumentList"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayInitiativeInstrumentsGet)["request"]>
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
            idpayInitiativeInstrumentsGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayInitiativeInstrumentsGet.success(response.value)
              : idpayInitiativeInstrumentsGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(
      idpayInitiativeInstrumentsGet.failure({ ...getNetworkError(e) })
    );
  }
}

/**
 * Handle the refresh polling for the initiative instruments
 */
export function* handleInitiativeInstrumentsRefresh(
  initiativeId: string,
  refreshDelay: number = 3000
) {
  yield* put(
    idpayInitiativeInstrumentsGet.request({
      initiativeId
    })
  );
  while (true) {
    yield* delay(refreshDelay);
    yield* put(
      idpayInitiativeInstrumentsGet.request({
        initiativeId,
        isRefreshing: true
      })
    );
  }
}
