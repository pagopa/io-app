import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayWalletClient } from "../api/client";
import {
  IdPayInitiativesFromInstrumentPayloadType,
  idPayInitiativesFromInstrumentGet
} from "../store/actions";

export function* handleGetIDPayInitiativesFromInstrument(
  getInitiativesWithInstrument: IDPayWalletClient["getInitiativesWithInstrument"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayInitiativesFromInstrumentPayloadType
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
            idPayInitiativesFromInstrumentGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return idPayInitiativesFromInstrumentGet.success(res.value);
            }
            return idPayInitiativesFromInstrumentGet.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      idPayInitiativesFromInstrumentGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
