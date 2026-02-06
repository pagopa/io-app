import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayTimelineDetailsGet } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

/**
 * Handle the remote call to retrieve the IDPay operation details
 * @param getTimelineDetail BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetTimelineDetails(
  getTimelineDetail: IDPayClient["getTimelineDetail"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayTimelineDetailsGet)["request"]>
) {
  const getTimelineDetailRequest = getTimelineDetail({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId,
    operationId: action.payload.operationId
  });

  try {
    const getTimelineDetailResult = (yield* call(
      withRefreshApiCall,
      getTimelineDetailRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTimelineDetail>;

    yield pipe(
      getTimelineDetailResult,
      E.fold(
        error =>
          put(
            idpayTimelineDetailsGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayTimelineDetailsGet.success(response.value)
              : idpayTimelineDetailsGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idpayTimelineDetailsGet.failure({ ...getNetworkError(e) }));
  }
}
