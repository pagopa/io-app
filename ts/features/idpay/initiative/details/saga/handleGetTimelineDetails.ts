import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayClient } from "../../../common/api/client";
import {
  idpayTimelineDetailsGet,
  IdPayTimelineDetailsGetPayloadType
} from "../store/actions";

export function* handleGetTimelineDetails(
  getTimelineDetail: IDPayClient["getTimelineDetail"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayTimelineDetailsGetPayloadType
) {
  try {
    const getTimelineDetailResult: SagaCallReturnType<
      typeof getTimelineDetail
    > = yield* call(getTimelineDetail, {
      bearerAuth: token,
      "Accept-Language": language,
      initiativeId: payload.initiativeId,
      operationId: payload.operationId
    });
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
