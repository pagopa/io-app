import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayWalletClient } from "../api/client";
import {
  IdpayWalletInitiativeGetPayloadType,
  idPayWalletInitiativesGet
} from "../store/actions";

export function* handleGetIDPayInitiativesWithInstrument(
  getInitiativesWithInstrument: IDPayWalletClient["getInitiativesWithInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdpayWalletInitiativeGetPayloadType
) {
  try {
    const getInitiativesWithInstrumentResult: SagaCallReturnType<
      typeof getInitiativesWithInstrument
    > = yield* call(getInitiativesWithInstrument, {
      idWallet: payload.idWallet,
      bearerAuth: token,
      "Accept-Language": language
    });
    yield* put(
      pipe(
        getInitiativesWithInstrumentResult,
        E.fold(
          error =>
            idPayWalletInitiativesGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return idPayWalletInitiativesGet.success(res.value);
            }
            return idPayWalletInitiativesGet.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(idPayWalletInitiativesGet.failure({ ...getNetworkError(e) }));
  }
}
