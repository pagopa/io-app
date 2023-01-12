import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayTimelineClient } from "../api/client";
import { idpayTimelinePageSelector, idpayTimelineSelector } from "../store";
import {
  IdPayInitiativeGetPayloadType,
  idpayTimelineGet,
  idpayTimelinePaginationGet
} from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getTimeline
 * @param action
 * @param initiativeId
 */

export function* handleGetTimelinePagination(
  getTimeline: IDPayTimelineClient["getTimeline"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayInitiativeGetPayloadType
) {
  try {
    const currentTimeline = yield* select(idpayTimelineSelector);
    const potTimelinePage = yield* select(idpayTimelinePageSelector);
    const pageNumberSome = pot.getOrElse(potTimelinePage, 1);

    const getTimelineResult: SagaCallReturnType<typeof getTimeline> =
      yield* call(getTimeline, {
        bearerAuth: token,
        "Accept-Language": language,
        initiativeId: payload.initiativeId,
        page: pageNumberSome
      });

    yield pipe(
      getTimelineResult,
      E.fold(
        error =>
          put(
            idpayTimelinePaginationGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response => {
          if (response.status === 200) {
            const currentTimelineSome = pot.getOrElse(currentTimeline, {
              lastUpdate: new Date("1970-01-01"),
              operationList: []
            });
            const newTimeline: TimelineDTO = {
              lastUpdate: new Date(
                // gets the latest date between the two,
                // and formats it as new date
                Math.max(
                  ...[
                    currentTimelineSome.lastUpdate,
                    response.value.lastUpdate
                  ].map(Number)
                )
              ),
              operationList: [
                ...currentTimelineSome.operationList,
                ...response.value.operationList
              ]
            };
            return put(idpayTimelinePaginationGet.success(newTimeline));
          } else {
            return put(
              idpayTimelinePaginationGet.failure({
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
    yield* put(idpayTimelineGet.failure({ ...getNetworkError(e) }));
  }
}
