import * as E from "fp-ts/lib/Either";

import {
  IdPayInitiativesFromInstrumentPayloadType,
  idPayInitiativesFromInstrumentGet,
  idpayInitiativesFromInstrumentRefreshEnd,
  idpayInitiativesFromInstrumentRefreshStart
} from "../store/actions";
import { SagaGenerator, call, delay, put } from "typed-redux-saga/macro";
import { getGenericError, getNetworkError } from "../../../../utils/errors";

import { IDPayClient } from "../../common/api/client";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { pipe } from "fp-ts/lib/function";
import { readablePrivacyReport } from "../../../../utils/reporters";

export function* handleGetIDPayInitiativesFromInstrument(
  getInitiativesWithInstrument: IDPayClient["getInitiativesWithInstrument"],
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

export function* initiativesFromInstrumentRefresh(
  idWallet: string,
  isRefreshCall: boolean = false,
  delayMs: number = 3000
): SagaGenerator<void> {
  yield* put(
    idPayInitiativesFromInstrumentGet.request({
      idWallet,
      isRefreshCall
    })
  );
  yield* delay(delayMs);
  yield* initiativesFromInstrumentRefresh(idWallet, true, delayMs); // initiativesFromInstrumentRefresh(idWallet, true);
}
