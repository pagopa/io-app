import * as E from "fp-ts/lib/Either";

import { pipe } from "fp-ts/lib/function";
import { call, delay, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayClient } from "../../common/api/client";
import { idPayInitiativesFromInstrumentGet } from "../store/actions";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

export function* handleGetIDPayInitiativesFromInstrument(
  getInitiativesWithInstrument: IDPayClient["getInitiativesWithInstrument"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayInitiativesFromInstrumentGet)["request"]>
) {
  const getInitiativesWithInstrumentRequest = getInitiativesWithInstrument({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    idWallet: action.payload.idWallet
  });

  try {
    const getInitiativesWithInstrumentResult = (yield* call(
      withRefreshApiCall,
      getInitiativesWithInstrumentRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getInitiativesWithInstrument>;

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

export function* handleInitiativesFromInstrumentRefresh(
  idWallet: string,
  refreshDelay: number = 5000
) {
  while (true) {
    yield* delay(refreshDelay);
    yield* put(
      idPayInitiativesFromInstrumentGet.request({
        idWallet,
        isRefreshing: true
      })
    );
  }
}
