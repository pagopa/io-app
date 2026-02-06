import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayInitiativesInstrumentDelete } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

export function* handleInitiativeInstrumentDelete(
  deleteInstrument: IDPayClient["deleteInstrument"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayInitiativesInstrumentDelete)["request"]>
) {
  const updateInstrumentStatusRequest = deleteInstrument({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId,
    instrumentId: action.payload.instrumentId
  });

  try {
    const updateInstrumentStatusResult = (yield* call(
      withRefreshApiCall,
      updateInstrumentStatusRequest,
      action
    )) as unknown as SagaCallReturnType<typeof deleteInstrument>;

    yield* put(
      pipe(
        updateInstrumentStatusResult,
        E.fold(
          error => {
            I18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
            return idpayInitiativesInstrumentDelete.failure({
              initiativeId: action.payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            });
          },
          response => {
            if (response.status === 200) {
              // handled success
              return idpayInitiativesInstrumentDelete.success({
                initiativeId: action.payload.initiativeId
              });
            }
            // not handled error codes
            I18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
            return idpayInitiativesInstrumentDelete.failure({
              initiativeId: action.payload.initiativeId,
              error: {
                ...getGenericError(new Error(`res status:${response.value}`))
              }
            });
          }
        )
      )
    );
  } catch (e) {
    I18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
    yield* put(
      idpayInitiativesInstrumentDelete.failure({
        initiativeId: action.payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}
