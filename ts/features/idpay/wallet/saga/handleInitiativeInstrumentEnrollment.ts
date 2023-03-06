import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayWalletClient } from "../api/client";
import {
  IdpayInitiativesInstrumentEnrollPayloadType,
  IdpayInitiativesInstrumentDeletePayloadType,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../store/actions";
import { showToast } from "../../../../utils/showToast";
import TypedI18n from "../../../../i18n";

export function* handleInitiativeInstrumentEnrollment(
  enrollInstrument: IDPayWalletClient["enrollInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdpayInitiativesInstrumentEnrollPayloadType
) {
  try {
    const updateInstrumentStatusResult: SagaCallReturnType<
      typeof enrollInstrument
    > = yield* call(enrollInstrument, {
      bearerAuth: token,
      "Accept-Language": language,
      idWallet: payload.idWallet,
      initiativeId: payload.initiativeId
    });
    yield* put(
      pipe(
        updateInstrumentStatusResult,
        E.fold(
          error => {
            showToast(
              TypedI18n.t(
                "idpay.wallet.initiativePairing.errorToasts.enrollment"
              )
            );
            return idpayInitiativesInstrumentEnroll.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            });
          },
          response => {
            if (response.status === 200) {
              // handled success
              return idpayInitiativesInstrumentEnroll.success({
                initiativeId: payload.initiativeId
              });
            }
            // not handled error codes
            showToast(
              TypedI18n.t(
                "idpay.wallet.initiativePairing.errorToasts.enrollment"
              )
            );
            return idpayInitiativesInstrumentEnroll.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(`res status:${response.value}`))
              }
            });
          }
        )
      )
    );
  } catch (e) {
    showToast(
      TypedI18n.t("idpay.wallet.initiativePairing.errorToasts.enrollment")
    );
    yield* put(
      idpayInitiativesInstrumentEnroll.failure({
        initiativeId: payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}

export function* handleInitiativeInstrumentDelete(
  deleteInstrument: IDPayWalletClient["deleteInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdpayInitiativesInstrumentDeletePayloadType
) {
  try {
    const updateInstrumentStatusResult: SagaCallReturnType<
      typeof deleteInstrument
    > = yield* call(deleteInstrument, {
      bearerAuth: token,
      "Accept-Language": language,
      instrumentId: payload.instrumentId,
      initiativeId: payload.initiativeId
    });
    yield* put(
      pipe(
        updateInstrumentStatusResult,
        E.fold(
          error => {
            TypedI18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
            return idpayInitiativesInstrumentDelete.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            });
          },
          response => {
            if (response.status === 200) {
              // handled success
              return idpayInitiativesInstrumentDelete.success({
                initiativeId: payload.initiativeId
              });
            }
            // not handled error codes
            TypedI18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
            return idpayInitiativesInstrumentDelete.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(`res status:${response.value}`))
              }
            });
          }
        )
      )
    );
  } catch (e) {
    TypedI18n.t("idpay.wallet.initiativePairing.errorToasts.removal");
    yield* put(
      idpayInitiativesInstrumentDelete.failure({
        initiativeId: payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}
