import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayWalletClient } from "../api/client";
import {
  IdpayInitiativesPairingPayloadType,
  idpayInitiativesPairingDelete,
  idpayInitiativesPairingPut
} from "../store/actions";

export function* handleInitiativePairing(
  updateInstrumentStatus:
    | IDPayWalletClient["enrollInstrument"]
    | IDPayWalletClient["deleteInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  updatePairingStatusAction:
    | typeof idpayInitiativesPairingPut
    | typeof idpayInitiativesPairingDelete,
  payload: IdpayInitiativesPairingPayloadType
) {
  try {
    const updateInstrumentStatusResult: SagaCallReturnType<
      typeof updateInstrumentStatus
    > = yield* call(updateInstrumentStatus, {
      bearerAuth: token,
      "Accept-Language": language,
      idWallet: payload.idWallet,
      initiativeId: payload.initiativeId
    });
    yield* put(
      pipe(
        updateInstrumentStatusResult,
        E.fold(
          error =>
            updatePairingStatusAction.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            }),
          response => {
            if (response.status === 200) {
              // handled success
              return updatePairingStatusAction.success({
                initiativeId: payload.initiativeId
              });
            }
            // not handled error codes
            return updatePairingStatusAction.failure({
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
    yield* put(
      updatePairingStatusAction.failure({
        initiativeId: payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}
