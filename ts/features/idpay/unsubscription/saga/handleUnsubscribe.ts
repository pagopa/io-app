import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayUnsubscribeAction } from "../store/actions";
import { walletRemoveCards } from "../../../wallet/store/actions/cards";

export function* handleUnsubscribe(
  unsubscribe: IDPayClient["unsubscribe"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayUnsubscribeAction)["request"]>
) {
  const unsubscribeRequest = unsubscribe({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const getTimelineResult = (yield* call(
      withRefreshApiCall,
      unsubscribeRequest,
      action
    )) as unknown as SagaCallReturnType<typeof unsubscribe>;

    yield* pipe(
      getTimelineResult,
      E.fold(
        error =>
          put(
            idPayUnsubscribeAction.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response => {
          if (response.status === 204) {
            return [
              put(walletRemoveCards([`idpay_${action.payload.initiativeId}`])),
              put(idPayUnsubscribeAction.success())
            ];
          } else {
            return put(
              idPayUnsubscribeAction.failure({
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
    yield* put(idPayUnsubscribeAction.failure({ ...getNetworkError(e) }));
  }
}
