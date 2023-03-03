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
  IdpayInitiativesUnpairPayloadType,
  idpayInitiativesPairingDelete,
  idpayInitiativesPairingPut
} from "../store/actions";
import { showToast } from "../../../../utils/showToast";

type ClientWithProps =
  | {
      client: IDPayWalletClient["deleteInstrument"];
      props: IdpayInitiativesUnpairPayloadType;
      action: typeof idpayInitiativesPairingDelete;
    }
  | {
      client: IDPayWalletClient["enrollInstrument"];
      props: IdpayInitiativesPairingPayloadType;
      action: typeof idpayInitiativesPairingPut;
    };

export function* handleInitiativePairing(
  updateInstrumentStatus: ClientWithProps["client"],
  token: string,
  language: PreferredLanguageEnum,
  updatePairingStatusAction: ClientWithProps["action"],
  payload: ClientWithProps["props"]
) {
  try {
    const updateInstrumentStatusResult: SagaCallReturnType<
      typeof updateInstrumentStatus
    > =
      "idWallet" in payload
        ? yield* call(updateInstrumentStatus, {
            bearerAuth: token,
            "Accept-Language": language,
            idWallet: payload.idWallet,
            initiativeId: payload.initiativeId
          })
        : yield* call(updateInstrumentStatus, {
            bearerAuth: token,
            "Accept-Language": language,
            initiativeId: payload.initiativeId,
            instrumentId: payload.instrumentId
          });
    yield* put(
      pipe(
        updateInstrumentStatusResult,
        E.fold(
          error => {
            showToast("Errore nel collegamento, riprova");
            return updatePairingStatusAction.failure({
              initiativeId: payload.initiativeId,
              error: {
                ...getGenericError(new Error(readablePrivacyReport(error)))
              }
            });
          },
          response => {
            if (response.status === 200) {
              // handled success
              return updatePairingStatusAction.success({
                initiativeId: payload.initiativeId
              });
            }
            // not handled error codes
            showToast("Errore nel collegamento, riprova");
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
    showToast("Errore nel collegamento, riprova");
    yield* put(
      updatePairingStatusAction.failure({
        initiativeId: payload.initiativeId,
        error: { ...getNetworkError(e) }
      })
    );
  }
}
