import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayTimelineClient } from "../api/client";
import {
  IdPayInitiativeGetPayloadType,
  idpayTimelineGet
} from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getTimeline
 * @param action
 * @param initiativeId
 */
export function* handleGetTimeline(
  getTimeline: IDPayTimelineClient["getTimeline"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayInitiativeGetPayloadType
) {
  try {
    const getTimelineResult: SagaCallReturnType<typeof getTimeline> =
      yield* call(getTimeline, {
        bearerAuth: token,
        "Accept-Language": language,
        initiativeId: payload.initiativeId
      });
    yield pipe(
      getTimelineResult,
      E.fold(
        error =>
          put(
            idpayTimelineGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayTimelineGet.success(response.value)
              : idpayTimelineGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idpayTimelineGet.failure({ ...getNetworkError(e) }));
  }
}
