import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayTimelineClient } from "../api/client";
import {
  IdpayTimelinePageGetPayloadType,
  idpayTimelinePageGet
} from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getTimeline
 * @param action
 * @param initiativeId
 */

export function* handleGetTimelinePage(
  getTimeline: IDPayTimelineClient["getTimeline"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdpayTimelinePageGetPayloadType
) {
  try {
    const getTimelineResult: SagaCallReturnType<typeof getTimeline> =
      yield* call(getTimeline, {
        bearerAuth: token,
        "Accept-Language": language,
        initiativeId: payload.initiativeId,
        page: payload.page,
        size: payload.pageSize
      });

    yield pipe(
      getTimelineResult,
      E.fold(
        error =>
          put(
            idpayTimelinePageGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response => {
          if (response.status === 200) {
            return put(
              idpayTimelinePageGet.success({
                timeline: response.value,
                page: response.value.pageNo ?? 0
              })
            );
          } else {
            return put(
              idpayTimelinePageGet.failure({
                ...getGenericError(new Error(String(response.status)))
              })
            );
          }
        }
      )
    );
  } catch (e) {
    yield* put(idpayTimelinePageGet.failure({ ...getNetworkError(e) }));
  }
}
