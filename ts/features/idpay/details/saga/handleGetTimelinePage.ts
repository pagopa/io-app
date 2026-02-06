import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayTimelinePageGet } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

/**
 * Handle the remote call to retrieve the IDPay initiative operations timeline page
 * @param getTimeline BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetTimelinePage(
  getTimeline: IDPayClient["getTimeline"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayTimelinePageGet)["request"]>
) {
  const getTimelineRequest = getTimeline({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId,
    page: action.payload.page || 0,
    size: action.payload.pageSize
  });

  try {
    const getTimelineResult = (yield* call(
      withRefreshApiCall,
      getTimelineRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTimeline>;

    yield pipe(
      getTimelineResult,
      E.fold(
        error => {
          put(
            idpayTimelinePageGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          );
        },
        response => {
          if (response.status === 200) {
            return put(
              idpayTimelinePageGet.success({
                timeline: response.value,
                page: response.value.pageNo ?? 1
              })
            );
          } else {
            return put(
              idpayTimelinePageGet.failure({
                ...getGenericError(
                  new Error(`response status code ${response.status}`)
                )
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
