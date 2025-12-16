import { IOToast } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayInitiativesInstrumentEnroll } from "../store/actions";

export function* handleInitiativeInstrumentEnrollment(
  enrollInstrument: IDPayClient["enrollInstrument"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayInitiativesInstrumentEnroll)["request"]>
) {
  const updateInstrumentStatusRequest = enrollInstrument({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId,
    idWallet: action.payload.idWallet
  });

  try {
    const updateInstrumentStatusResult = (yield* call(
      withRefreshApiCall,
      updateInstrumentStatusRequest,
      action
    )) as unknown as SagaCallReturnType<typeof enrollInstrument>;

    yield* put(
      pipe(
        updateInstrumentStatusResult,
        E.fold(
          error => {
            IOToast.error(
              I18n.t("idpay.wallet.initiativePairing.errorToasts.enrollment")
            );
            return idpayInitiativesInstrumentEnroll.failure({
              initiativeId: action.payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            });
          },
          response => {
            if (response.status === 200) {
              // handled success
              return idpayInitiativesInstrumentEnroll.success({
                initiativeId: action.payload.initiativeId
              });
            }
            // not handled error codes
            IOToast.show(
              I18n.t("idpay.wallet.initiativePairing.errorToasts.enrollment")
            );
            return idpayInitiativesInstrumentEnroll.failure({
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
    IOToast.error(
      I18n.t("idpay.wallet.initiativePairing.errorToasts.enrollment")
    );
    yield* put(
      idpayInitiativesInstrumentEnroll.failure({
        initiativeId: action.payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}
