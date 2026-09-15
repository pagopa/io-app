import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { err, ok, Result } from "neverthrow";
import { call, delay, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayInitiativesFromInstrumentGet } from "../store/actions";

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

    const result = (
      "isOk" in getInitiativesWithInstrumentResult
        ? getInitiativesWithInstrumentResult
        : "right" in getInitiativesWithInstrumentResult
          ? ok(getInitiativesWithInstrumentResult.right)
          : err(getInitiativesWithInstrumentResult.left)
    ) as Result<
      Extract<
        SagaCallReturnType<typeof getInitiativesWithInstrument>,
        { right: unknown }
      >["right"],
      unknown
    >;

    yield* put(
      result.match(
        res => {
          if (res.status === 200) {
            return idPayInitiativesFromInstrumentGet.success(res.value);
          }
          return idPayInitiativesFromInstrumentGet.failure({
            ...getGenericError(new Error(`Error: ${res.status}`))
          });
        },
        error =>
          idPayInitiativesFromInstrumentGet.failure({
            ...getGenericError(
              new Error(
                readablePrivacyReport(
                  error as Parameters<typeof readablePrivacyReport>[0]
                )
              )
            )
          })
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
  refreshDelay = 5000
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
