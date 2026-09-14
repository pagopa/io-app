import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import I18n from "i18next";
import { err, ok, Result } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayInitiativesInstrumentDelete } from "../store/actions";

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

    const result = (
      "isOk" in updateInstrumentStatusResult
        ? updateInstrumentStatusResult
        : "right" in updateInstrumentStatusResult
          ? ok(updateInstrumentStatusResult.right)
          : err(updateInstrumentStatusResult.left)
    ) as Result<
      Extract<
        SagaCallReturnType<typeof deleteInstrument>,
        { right: unknown }
      >["right"],
      unknown
    >;

    yield* put(
      result.match(
        response => {
          if (response.status === 200) {
            return idpayInitiativesInstrumentDelete.success({
              initiativeId: action.payload.initiativeId
            });
          }
          I18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
          return idpayInitiativesInstrumentDelete.failure({
            initiativeId: action.payload.initiativeId,
            error: {
              ...getGenericError(new Error(`res status:${response.value}`))
            }
          });
        },
        error => {
          I18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
          return idpayInitiativesInstrumentDelete.failure({
            initiativeId: action.payload.initiativeId,
            error: {
              ...getGenericError(
                new Error(
                  readablePrivacyReport(
                    error as Parameters<typeof readablePrivacyReport>[0]
                  )
                )
              )
            }
          });
        }
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
