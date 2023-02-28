import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayWalletClient } from "../api/client";
import {
  IdpayInitiativesPairingPutPayloadType,
  idpayInitiativesPairingPut
} from "../store/actions";

export function* handlePutInitiativePairing(
  enrollInstrument: IDPayWalletClient["enrollInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdpayInitiativesPairingPutPayloadType
) {
  try {
    const enrollInstrumentResult: SagaCallReturnType<typeof enrollInstrument> =
      yield* call(enrollInstrument, {
        bearerAuth: token,
        "Accept-Language": language,
        idWallet: payload.idWallet,
        initiativeId: payload.initiativeId
      });
    yield* put(
      pipe(
        enrollInstrumentResult,
        E.fold(
          error =>
            idpayInitiativesPairingPut.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            }),
          response => {
            if (response.status === 200) {
              // handled success
              return idpayInitiativesPairingPut.success({
                initiativeId: payload.initiativeId
              });
            }
            // not handled error codes

            return idpayInitiativesPairingPut.failure({
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
      idpayInitiativesPairingPut.failure({
        initiativeId: payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}
