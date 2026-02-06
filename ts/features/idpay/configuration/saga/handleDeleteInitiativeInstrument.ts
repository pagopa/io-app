import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import {
  idpayInitiativeInstrumentDelete,
  idpayInitiativeInstrumentsGet
} from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

/**
 * Handle the remote call to delete the IDPay initiative associated payment methods for initiatives
 * @param deleteInitiativeInstrument BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleDeleteInitiativeInstruments(
  deleteInitiativeInstrument: IDPayClient["deleteInstrument"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayInitiativeInstrumentDelete)["request"]>
) {
  const getInitiativeDetailsRequest = deleteInitiativeInstrument({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId,
    instrumentId: action.payload.instrumentId
  });

  try {
    const deleteInitiativeInstrumentResult = (yield* call(
      withRefreshApiCall,
      getInitiativeDetailsRequest,
      action
    )) as unknown as SagaCallReturnType<typeof deleteInitiativeInstrument>;

    yield pipe(
      deleteInitiativeInstrumentResult,
      E.fold(
        error =>
          put(
            idpayInitiativeInstrumentDelete.failure({
              instrumentId: action.payload.instrumentId,
              error: getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayInitiativeInstrumentDelete.success({
                  initiativeId: action.payload.initiativeId,
                  instrumentId: action.payload.instrumentId
                })
              : idpayInitiativeInstrumentDelete.failure({
                  instrumentId: action.payload.instrumentId,
                  error: getGenericError(
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
