import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { err, ok } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayTimelinePageGet } from "../store/actions";

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

    yield (
      "isOk" in getTimelineResult
        ? getTimelineResult
        : "right" in getTimelineResult
          ? ok(getTimelineResult.right)
          : err(getTimelineResult.left)
    ).match(
      response => {
        if (response.status === 200) {
          return put(
            idpayTimelinePageGet.success({
              timeline: response.value,
              page: response.value.pageNo ?? 1
            })
          );
        }
        return put(
          idpayTimelinePageGet.failure({
            ...getGenericError(
              new Error(`response status code ${response.status}`)
            )
          })
        );
      },
      error =>
        put(
          idpayTimelinePageGet.failure({
            ...getGenericError(new Error(readablePrivacyReport(error)))
          })
        )
    );
  } catch (e) {
    yield* put(idpayTimelinePageGet.failure({ ...getNetworkError(e) }));
  }
}
