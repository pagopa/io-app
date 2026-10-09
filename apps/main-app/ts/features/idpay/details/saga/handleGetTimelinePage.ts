import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import {
  decodeFailureReason,
  FailureReason,
  FailureReasonError
} from "../../../../utils/failureReason";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayTimelinePageGet } from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative operations timeline
 * page
 *
 * @param getTimeline BE API call
 * @param bearerToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetTimelinePage(
  getTimeline: IDPayClient["getTimeline"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayTimelinePageGet)["request"]>
) {
  const { initiativeId } = action.payload;
  const getTimelineRequest = getTimeline({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId,
    page: action.payload.page || 0,
    size: action.payload.pageSize
  });

  try {
    const getTimelineResult = (yield* call(
      withRefreshApiCall,
      getTimelineRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTimeline>;

    if (E.isLeft(getTimelineResult)) {
      yield* put(
        idpayTimelinePageGet.failure({
          initiativeId,
          error: getGenericError(
            new FailureReasonError(
              FailureReason.DECODE_ERROR,
              readablePrivacyReport(getTimelineResult.left)
            )
          )
        })
      );
      return;
    }

    const response = getTimelineResult.right;
    if (response.status !== 200) {
      yield* put(
        idpayTimelinePageGet.failure({
          initiativeId,
          error: getGenericError(
            new FailureReasonError(
              decodeFailureReason({
                kind: "http_status",
                status: response.status
              }),
              `response status code ${response.status}`
            )
          )
        })
      );
      return;
    }

    yield* put(
      idpayTimelinePageGet.success({
        timeline: response.value,
        page: response.value.pageNo ?? 1
      })
    );
  } catch (e) {
    yield* put(
      idpayTimelinePageGet.failure({ initiativeId, error: getNetworkError(e) })
    );
  }
}
